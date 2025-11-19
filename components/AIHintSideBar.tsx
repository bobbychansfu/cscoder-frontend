"use client"

interface SideBarProps{
    open: boolean
    hints: Array<object>
}


function AIHintSideBar(props: SideBarProps){

    return (
        <>
            <div>

                <div
                    className={`fixed top-0 left-0 h-full w-64 bg-white text-red-800 p-4 transform transition-transform duration-300 ${
                        props.open ? "translate-x-0" : "-translate-x-full"
                    }`}
                >
                    <h2 className="text-xl font-semibold mb-4">Hints</h2>
                    <p> { props.hints.length > 0 ? JSON.stringify(props.hints) : "No hints"}</p>
                </div>
            </div>
        </>
    )

}

export {AIHintSideBar};
export type {SideBarProps};