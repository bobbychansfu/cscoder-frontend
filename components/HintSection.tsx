"use client"

import CodeSegment from "@/components/ui/codesegment";

interface HintSectionProps {
    hint: object
}

function HintSection (props: HintSectionProps) {

    return (

        <>

            <div className="relative flex flex-col justify-center border-4 border-gray-300 text-center max-width-80 my-5 rounded-sm shadow-xl">

                <div>
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