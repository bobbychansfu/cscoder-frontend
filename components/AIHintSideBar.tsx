"use client"

import HintSection from "@/components/HintSection";
interface SideBarProps{
    open: boolean
    hints: Array<object>
}


function AIHintSideBar(props: SideBarProps){

    return (
        <>
            <div>

                <div
                    className={`fixed top-0 left-0 h-full w-[350px] bg-gray-200 text-red-800 p-4 transform 
                    transition-transform duration-300 rounded-md shadow-[10px_0px_10px_rgba(0,0,0,0.3)] overflow-auto ${
                        props.open ? "translate-x-0" : "-translate-x-full"
                    }`}
                >
                    <h2 className="text-xl font-semibold mb-4">Hints</h2>
                    { props.hints.length > 0 ?

                        <ul>
                            {props.hints.map((hint, index) => (
                                <li key={index}>
                                    <HintSection hint={hint} />
                                </li>
                            ))}
                        </ul>

                        :

                        <p className="font-bold text-black"> No hints </p>}
                </div>
            </div>
        </>
    )

}

export default AIHintSideBar;