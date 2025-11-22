"use client"

import CodeSegment from "@/components/ui/codesegment";

interface HintSectionProps {
    hint: object
}

function HintSection (props: HintSectionProps) {

    return (

        <>

            <div className="relative flex flex-col justify-center text-center max-width-80 my-5 p-2 rounded-sm shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3)]">

                <div className="mt-5">
                    <h3 className="font-bold text-black"> Hint {props.hint.request_num}</h3>
                </div>

                <div>

                    <CodeSegment code={props.hint.code} />

                </div>

                <div>

                    <p className="text-black"> {props.hint.feedback} </p>

                </div>



            </div>

        </>

    )

}

export default HintSection