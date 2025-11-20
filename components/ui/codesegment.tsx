"use client"

interface CodeSegmentProps {
    code: string
}

function CodeSegment (props: CodeSegmentProps) {

    return (

        <>
            <div className="rounded-sm bg-gray-300 w-auto h-auto p-2 m-3">

                <p className="font-firacode text-black"> {props.code} </p>

            </div>
        </>
    )

}

export default CodeSegment;