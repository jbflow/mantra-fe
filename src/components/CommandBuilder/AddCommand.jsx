import { useRef } from "react";


export default function AddCommand({ dispatch }) {
    const newValue = useRef(null);
    const addCmd = (cmd) => {
        dispatch({
            type: "ADD_CMD",
            payload: newValue.current,
        });
    };
    return (
        <>
            <div className="cmd-row cmd-r-add">
                <input
                    placeholder="Type new command here"
                    type="text"
                    onChange={(e) => {
                        newValue.current = e.target.value;
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") addCmd();
                    }}
                />

                <div
                    className="cmd-button cmd-button-add"
                    onClick={() => {
                        addCmd();
                    }}
                >
                    <img alt="" className="trash-button" src="./images/menu-icons/plus.svg" />
                </div>
            </div>
        </>
    );
}
