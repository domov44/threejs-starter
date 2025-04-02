import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const register = async (username: string, password: string) => {
    const email = `${username}@mail.com`;

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
        username,
        bestScore: 0,
        createdAt: new Date(),
    });

    return user;
};

export const login = async (username: string, password: string) => {
    const email = `${username}@mail.com`;

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
};

export const logout = async () => {
    await signOut(auth);
};

export const getCurrentUserData = async () => {
    const user = auth.currentUser;
    console.log(user)
    if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            return userDoc.data();
        } else {
            return {
                username: "Utilisateur inconnu",
                email: "Non renseigné",
                bestScore: 0,
            };
        }
    } else {
        return {
            username: "Invité",
            email: "Non connecté",
            bestScore: 0,
        };
    }
};

export const observeAuthState = (callback: (user: any) => void) => {
    onAuthStateChanged(auth, (user) => {
        callback(user);
    });
};
