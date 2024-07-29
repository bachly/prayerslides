import React from "react";
import _ from "underscore";

// firebase auth
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";
import { auth, db } from '../lib/firebaseApp';
import Link from "next/link";

// firebase firestore
import { doc, getDoc, collection, getDocs } from "firebase/firestore"

// ui
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"

export default function AdminPage() {
    const [couples, setCouples] = React.useState();
    const [user, loading] = useAuthState(auth);
    const [userData, setUserData] = React.useState({});

    React.useEffect(async () => {
        if (user) {
            // get extra user's data
            console.log("Logged in user:", user);

            const docRef = doc(db, "Users", user.email);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                console.log("Logged-in user's data:", docSnap.data());
                setUserData(docSnap.data());
            } else {
                console.log("Logged-in user's data: N/A");
            }

            // get couples
            const querySnapshot = await getDocs(collection(db, "Couples"));
            let couplesData = {}
            querySnapshot.forEach((doc) => {
                couplesData = {
                    ...couplesData,
                    [doc.id]: doc.data()
                }
            });
            setCouples(couplesData);
        }
    }, [user])

    function handleLogoutClick(event) {
        event.preventDefault();
        signOut(auth);
    }

    React.useEffect(() => {
        if (couples) {
            console.log("Couples:", couples);
        }
    }, [couples])

    return <div className="">
        <div className="flex items-start">
            <main className="flex-1">
                <div className="py-4 px-12 backdrop-blur-lg fixed top-0 left-0 w-full">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-bold text-neutral-200 text-2xl">
                                Admin
                            </div>
                        </div>
                        <div className="text-white">
                            {loading ? <>Loading...</> :
                                <>
                                    {user && <div className="flex items-center">
                                        {user.email} (<button className="underline" onClick={handleLogoutClick} >Log out</button>)
                                        <img src={user.photoURL} className="rounded-full ml-2 w-6 h-6" />
                                    </div>}
                                    {!user && <Link href="/login">Login</Link>}
                                </>
                            }
                        </div>
                    </div>
                </div>

                <div className="mt-20 p-8">
                    {user && !userData.admin && <>You're not an admin</>}

                    {user && userData.admin && couples && <>
                        <Table className="bg-background text-foreground">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Names</TableHead>
                                    <TableHead>BgImageName</TableHead>
                                    <TableHead>Surname</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Nation</TableHead>
                                    <TableHead>Group</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Object.entries(couples).map(([coupleId, coupleData]) => {
                                    return <TableRow key={coupleId} data-id={coupleId}>
                                        <TableCell><Input type="text" defaultValue={coupleData.names} placeholder="Names" /></TableCell>
                                        <TableCell><Input type="text" defaultValue={coupleData.bgImageName} placeholder="BgImageName" /></TableCell>
                                        <TableCell><Input type="text" defaultValue={coupleData.surname} placeholder="Surname" /></TableCell>
                                        <TableCell><Input type="text" defaultValue={coupleData.location} placeholder="Location" /></TableCell>
                                        <TableCell><Input type="text" defaultValue={coupleData.nation} placeholder="Nation" /></TableCell>
                                        <TableCell><Input type="text" defaultValue={coupleData.group} placeholder="Group" /></TableCell>
                                    </TableRow>
                                })}
                            </TableBody>
                        </Table>
                    </>}
                </div>
            </main>
        </div>
    </div>
}