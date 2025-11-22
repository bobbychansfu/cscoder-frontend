"use client"

interface CodeSegmentProps {
    code: string
}

function CodeSegment (props: CodeSegmentProps) {

    const formatted_code = props.code.replace(/\\n/g, "\n");

    return (

        <>
            <div className="rounded-sm bg-gray-300 w-auto h-auto p-2 m-3 overflow-auto">

                <p className="font-firacode text-black"> {formatted_code} </p>

            </div>
        </>
    )

}

export default CodeSegment;