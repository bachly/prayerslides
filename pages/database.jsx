import React from "react";
import _ from "underscore";

export default function Homepage() {
    const [couples, setCouples] = React.useState();

    React.useEffect(function readFromLocalStorage() {
        const couplesFromLocalStorage = JSON.parse(window.localStorage.getItem('couples'));

        if (couplesFromLocalStorage) {
            setCouples(couplesFromLocalStorage);
        } else {
            const couplesDict = {}
            defaultCouples.forEach((couple) => {
                const id = nanoid();
                couplesDict[id] = {
                    ...couple,
                    id
                };
            });
            setCouples(couplesDict);
        }

    }, [])

    return <div className="bg-white">
        {JSON.stringify(couples)}
    </div>
}
