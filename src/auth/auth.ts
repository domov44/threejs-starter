import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc, query, collection, orderBy, getDocs } from "firebase/firestore";

export const getLeaderboard = async (): Promise<{ username: string; bestScore: number }[]> => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy("bestScore", "asc"));

    const querySnapshot = await getDocs(q);
    const leaderboard: { username: string; bestScore: number }[] = [];

    querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.username && userData.bestScore !== undefined && userData.bestScore !== null) {
            leaderboard.push({
                username: userData.username,
                bestScore: userData.bestScore,
            });
        }
    });

    return leaderboard;
};


export const register = async (username: string, password: string) => {
    const lowercaseUsername = username.toLowerCase();
    const email = `${lowercaseUsername}@mail.com`;

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
        username: lowercaseUsername,
        bestScore: null,
        createdAt: new Date(),
    });

    return user;
};

export const login = async (username: string, password: string) => {
    const lowercaseUsername = username.toLowerCase();
    const email = `${lowercaseUsername}@mail.com`;

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
};

export const logout = async () => {
    await signOut(auth);
};

export const getCurrentUserData = async () => {
    const user = auth.currentUser;
    if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            return userDoc.data();
        } else {
            return {
                username: "Utilisateur inconnu",
                email: "Non renseigné",
                bestScore: null,
            };
        }
    } else {
        return {
            username: "Invité",
            email: "Non connecté",
            bestScore: null,
        };
    }
};

export const updateBestScore = async (newScore: number): Promise<void> => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        const userData = userSnap.data();
        const bestScore = userData.bestScore || Infinity;

        if (newScore < bestScore) {
            await setDoc(userRef, { bestScore: newScore }, { merge: true });
        }
    }
};

export const observeAuthState = (callback: (user: any) => void) => {
    onAuthStateChanged(auth, (user) => {
        callback(user);
    });
};
