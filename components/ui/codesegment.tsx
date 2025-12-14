"use client"

interface CodeSegmentProps {
    code: string
}

function CodeSegment (props: CodeSegmentProps) {

    // const formatted_code = props.code.replace(/\\n/g, "\n");

    return (

        <>
            <pre
                className="rounded-sm bg-gray-300 w-auto h-auto max-w-[450px] max-h-[170px] p-2 m-3
               overflow-auto whitespace-pre"
            >
                <code className="font-firacode text-black text-left">
                    {props.code}
                </code>
            </pre>
        </>
    )

}

export default CodeSegment;