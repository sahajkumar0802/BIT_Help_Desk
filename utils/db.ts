import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    updateProfile 
  } from 'firebase/auth';
  import { 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    addDoc, 
    updateDoc, 
    query, 
    where, 
    increment,
    serverTimestamp
  } from 'firebase/firestore';
  import { 
    ref, 
    uploadBytes, 
    getDownloadURL 
  } from 'firebase/storage';
  import { auth, db as firestore, storage } from './firebase';
  import { User, Issue } from '../types';
  
  class FirebaseDB {
    // --- HELPERS ---
  
    // Convert Base64 string to Blob for upload
    private async base64ToBlob(base64: string): Promise<Blob> {
      const res = await fetch(base64);
      return await res.blob();
    }
  
    // Upload image to Firebase Storage and get URL
    private async uploadImage(base64: string, path: string): Promise<string> {
      try {
        const blob = await this.base64ToBlob(base64);
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, blob);
        return await getDownloadURL(snapshot.ref);
      } catch (error) {
        console.error("Image upload failed:", error);
        throw new Error("Failed to upload image. Please check your connection.");
      }
    }
  
    // --- AUTH METHODS ---
  
    async register(userData: Omit<User, 'id'> & { password?: string }): Promise<{ user: User; token: string }> {
      if (!userData.password) throw new Error("Password is required");
      
      try {
        // 1. Create Auth User
        const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
        const firebaseUser = userCredential.user;
        
        // 2. Update Profile Name
        await updateProfile(firebaseUser, { displayName: userData.name });
  
        // 3. Create User Document in Firestore (to store role, dept, studentId)
        const newUser: User = {
          id: firebaseUser.uid,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          ...(userData.department ? { department: userData.department } : {}),
          ...(userData.studentId ? { studentId: userData.studentId } : {})
        };
  
        await setDoc(doc(firestore, "users", firebaseUser.uid), newUser);
        const token = await firebaseUser.getIdToken();
  
        return { user: newUser, token };
      } catch (error: any) {
        console.error("Registration error:", error);
        if (error.code === 'auth/email-already-in-use') throw new Error("Email already registered");
        throw error;
      }
    }
  
    async login(email: string, password?: string): Promise<{ user: User; token: string }> {
       if (!password) throw new Error("Password required for real authentication");
  
       try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
  
        // Fetch extra user details from Firestore
        const userDoc = await getDoc(doc(firestore, "users", firebaseUser.uid));
        
        if (!userDoc.exists()) {
          // Fallback if user document doesn't exist but auth does
           throw new Error("User profile not found in database.");
        }
  
        const userData = userDoc.data() as User;
        const token = await firebaseUser.getIdToken();
  
        return { user: userData, token };
       } catch (error: any) {
        console.error("Login error:", error);
        if (error.code === 'auth/invalid-credential') throw new Error("Invalid email or password");
        throw error;
       }
    }
  
    // --- ISSUE METHODS ---
  
    async getIssues(filter?: { department?: string, status?: string, createdBy?: string }): Promise<Issue[]> {
      try {
        const issuesRef = collection(firestore, 'issues');
        
        // We do NOT use orderBy here to avoid "Missing Index" errors on a fresh database.
        // We will sort the results in JavaScript instead.
        let q = query(issuesRef);
  
        if (filter?.department) {
          q = query(q, where('department', '==', filter.department));
        }
        if (filter?.createdBy) {
          q = query(q, where('createdBy', '==', filter.createdBy));
        }
  
        const querySnapshot = await getDocs(q);
        const issues: Issue[] = [];
        querySnapshot.forEach((doc) => {
          issues.push({ id: doc.id, ...doc.data() } as Issue);
        });
        
        // Sort by upvotes (highest first), then by timestamp (newest first) for tie-breaking
        return issues.sort((a, b) => {
          if (b.upvotes !== a.upvotes) {
            return b.upvotes - a.upvotes; // Higher upvotes first
          }
          return b.timestamp - a.timestamp; // Newer first if upvotes are equal
        });

      } catch (error) {
        console.error("Get Issues Error:", error);
        throw new Error("Could not fetch issues. Check database configuration.");
      }
    }
  
    async createIssue(issueData: Omit<Issue, 'id' | 'timestamp' | 'upvotes' | 'reports' | 'status'>): Promise<Issue> {
      try {
        let imageUrl = issueData.imageUrl;
  
        // If image is Base64, upload to Storage
        if (imageUrl && imageUrl.startsWith('data:')) {
           const filename = `issues/${Date.now()}_${Math.random().toString(36).substring(7)}`;
           imageUrl = await this.uploadImage(imageUrl, filename);
        }
  
        const newIssueData = {
          ...issueData,
          imageUrl: imageUrl || null,
          upvotes: 0,
          reports: 0,
          status: 'open',
          timestamp: Date.now()
        };
  
        const docRef = await addDoc(collection(firestore, "issues"), newIssueData);
        
        return { id: docRef.id, ...newIssueData } as Issue;
      } catch (error) {
        console.error("Create Issue Error:", error);
        throw error;
      }
    }
  
    async updateIssue(id: string, updates: Partial<Issue>): Promise<void> {
      try {
        const issueRef = doc(firestore, "issues", id);
        
        // Handle image upload for resolution if present
        if (updates.resolvedImageUrl && updates.resolvedImageUrl.startsWith('data:')) {
          const filename = `resolutions/${id}_${Date.now()}`;
          updates.resolvedImageUrl = await this.uploadImage(updates.resolvedImageUrl, filename);
        }

        // Remove any undefined fields before sending to Firestore
        const cleanUpdates: Partial<Issue> = {};
        Object.entries(updates).forEach(([key, value]) => {
          if (value !== undefined) {
            // @ts-expect-error: dynamic key assignment
            cleanUpdates[key] = value;
          }
        });

        await updateDoc(issueRef, cleanUpdates);
      } catch (error) {
        console.error("Update Issue Error:", error);
        throw error;
      }
    }
    
    async upvoteIssue(id: string): Promise<void> {
      try {
        const issueRef = doc(firestore, "issues", id);
        await updateDoc(issueRef, {
          upvotes: increment(1)
        });
      } catch (error) {
        console.error("Upvote Error:", error);
      }
    }
  }
  
  export const db = new FirebaseDB();