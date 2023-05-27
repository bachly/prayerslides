import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react"
import { AiOutlineCheckCircle, AiOutlineDownload } from "react-icons/ai";

const SCALE_FACTOR = 3.84;
const CONFIG = {
    X: 1920,
    Y: 1080,
    flagX: 65,
    flag1Y: 238,
    flag2Y: 588,
    flag3Y: 820,
    locationX: 185,
    location1Y: 288,
    location2Y: 638,
    location3Y: 873,
    nameX: 65,
    name1Y: 360,
    surname1Y: 426,
    name2Y: 722,
    surname2Y: 789,
    name3Y: 958,
    surname3Y: 1025
}

export default function Slide({
    id,
    bgImageName,
    location1, location2, location3,
    nation1, nation2, nation3,
    name1, name2, name3,
    surname1, surname2, surname3,
    id1, id2, id3,
    onDownload,
    isDownloaded,
    onUpdate
}) {
    const canvasRef = useRef();
    const downloadCanvasRef = useRef();
    const downloadLinkRef = useRef();
    const [downloadDataUrl, setDownloadDataUrl] = useState(null);
    const [fields, setFields] = useState({
        location1, location2, location3,
        nation1, nation2, nation3,
        name1, name2, name3,
        surname1, surname2, surname3,
    })
    const [isEditing, setIsEditing] = useState(true);

    useEffect(() => {
        setFields({
            location1, location2, location3,
            nation1, nation2, nation3,
            name1, name2, name3,
            surname1, surname2, surname3,
        })
    }, [location1, location2, location3,
        nation1, nation2, nation3,
        name1, name2, name3,
        surname1, surname2, surname3,])

    useEffect(() => {
        const context = canvasRef.current.getContext("2d");
        renderSlide({
            context,
            scale: SCALE_FACTOR,
            fontSmall: "bold 8pt sans-serif",
            fontLarge: "bold 13pt sans-serif",
            bgImageName,
            location1, location2, location3,
            nation1, nation2, nation3,
            name1, name2, name3,
            surname1, surname2, surname3
        });
    })

    function handleDownload(event) {
        event && event.preventDefault();
        const context = downloadCanvasRef.current.getContext("2d");
        renderSlide({
            context,
            scale: 1,
            fontSmall: "bold 31pt sans-serif",
            fontLarge: "bold 50pt sans-serif",
            bgImageName,
            location1, location2, location3,
            nation1, nation2, nation3,
            name1, name2, name3,
            surname1, surname2, surname3
        })

        setTimeout(() => {
            setDownloadDataUrl(downloadCanvasRef.current.toDataURL());
            onDownload();
        }, 500)
    }

    useEffect(() => {
        if (downloadLinkRef.current) {
            downloadLinkRef.current.click();
            setDownloadDataUrl(null);
        }
    }, [downloadDataUrl])

    function saveCouple1() {
        return (event) => {
            event && event.preventDefault();
            onUpdate({
                id: id1,
                names: fields.name1,
                surname: fields.surname1,
                location: fields.location1,
                nation: fields.nation1,
            })
        }
    }

    function saveCouple2() {
        return (event) => {
            event && event.preventDefault();
            onUpdate({
                id: id2,
                names: fields.name2,
                surname: fields.surname2,
                location: fields.location2,
                nation: fields.nation2,
            })
        }
    }

    function saveCouple3() {
        return (event) => {
            event && event.preventDefault();
            onUpdate({
                id: id3,
                names: fields.name3,
                surname: fields.surname3,
                location: fields.location3,
                nation: fields.nation3,
            })
        }
    }

    function updateField(fieldName) {
        return (event) => {
            event && event.preventDefault();
            setFields({
                ...fields,
                [fieldName]: event.target.value
            })
        }
    }

    function toggleEdit() {
        setIsEditing(!isEditing);
    }

    return <div className="shadow-xl rounded-xl overflow-hidden">
        <canvas className="" ref={canvasRef} width={CONFIG.X / SCALE_FACTOR} height={CONFIG.Y / SCALE_FACTOR} />
        <canvas className="hidden" ref={downloadCanvasRef} width={CONFIG.X} height={CONFIG.Y} />

        <div className="px-4 py-2 flex justify-between items-center bg-white shadow-inner">
            <h1 className="text-2xl">Slide {id}.</h1>
            <div className="flex items-center justify-end">
                <button className={clsx("px-4 py-1 rounded-sm duration-300 transition",
                    isDownloaded ? "border border-transparent hover:border hover:border-emerald-600" : "bg-neutral-200 border border-neutral-800 hover:bg-neutral-300")} onClick={handleDownload}>
                    {isDownloaded ?
                        <div className="text-emerald-600 ml-2 text-base flex items-center">
                            Downloaded <AiOutlineCheckCircle size="20" className="ml-1" />
                        </div> :
                        <div className="text-neutral-800 ml-2 text-base flex items-center">
                            Download <AiOutlineDownload size="20" className="ml-1" />
                        </div>
                    }
                </button>

                {/* <button
                    className={clsx("ml-2 px-2 py-1 text-sm rounded-sm duration-300 transition bg-neutral-200 border border-neutral-800 hover:bg-neutral-300")}
                    onClick={toggleEdit}>
                    {isEditing ? <IconChevronUp size="20" /> : <IconChevronDown size="20" />}
                </button> */}
            </div>
        </div>

        {isEditing &&
            <div className="py-2 px-2 bg-neutral-200">
                <div className="flex flex-col">
                    <form onSubmit={saveCouple1()} className="border-b border-neutral-400 pt-2">
                        <div className="">
                            <input value={fields.location1} onChange={updateField('location1')} className="px-2 bg-neutral-200 mr-2 focus:bg-white" />
                            <input value={fields.nation1} onChange={updateField('nation1')} className="px-2 bg-neutral-200 focus:bg-white" />
                        </div>
                        <div className="">
                            <input disabled={true} value={fields.name1} onChange={updateField('name1')} className="px-2 bg-neutral-200 mr-2 disabled:text-neutral-600" />
                            <input disabled={true} value={fields.surname1} onChange={updateField('surname1')} className="px-2 bg-neutral-200 mr-2 disabled:text-neutral-600" />
                            <button className="my-1 border border-neutral-800 rounded-sm bg-neutral-200 px-2">Save</button>
                        </div>
                    </form>
                    <form onSubmit={saveCouple2()} className="border-b border-neutral-400 pt-2">
                        <div className="">
                            <input value={fields.location2} onChange={updateField('location2')} className="px-2 bg-neutral-200 mr-2 focus:bg-white" />
                            <input value={fields.nation2} onChange={updateField('nation2')} className="px-2 bg-neutral-200 mr-2 focus:bg-white" />
                        </div>
                        <div className="">
                            <input value={fields.name2} onChange={updateField('name2')} className="px-2 bg-neutral-200 mr-2 focus:bg-white" />
                            <input value={fields.surname2} onChange={updateField('surname2')} className="px-2 bg-neutral-200 mr-2 focus:bg-white" />
                            <button className="my-1 border border-neutral-800 rounded-sm bg-neutral-200 px-2">Save</button>
                        </div>
                    </form>
                    <form onSubmit={saveCouple3()}>
                        <div className="">
                            <input value={fields.location3} onChange={updateField('location3')} className="px-2 bg-neutral-200 mr-2 focus:bg-white" />
                            <input value={fields.nation3} onChange={updateField('nation3')} className="px-2 bg-neutral-200 mr-2 focus:bg-white" />
                        </div>
                        <div className="">
                            <input value={fields.name3} onChange={updateField('name3')} className="px-2 bg-neutral-200 mr-2 focus:bg-white" />
                            <input value={fields.surname3} onChange={updateField('surname3')} className="px-2 bg-neutral-200 mr-2 focus:bg-white" />
                            <button className="my-1 border border-neutral-800 rounded-sm bg-neutral-200 px-2">Save</button>
                        </div>
                    </form>
                </div>
            </div>
        }

        <a className="hidden"
            ref={downloadLinkRef}
            href={downloadDataUrl}
            download={`${id}. Prayer Slide ${name1}.jpeg`}>Download Link</a>
    </div>
}

function renderSlide({ context, scale = 1, fontSmall, fontLarge, bgImageName,
    location1, location2, location3, nation1, nation2, nation3,
    name1, name2, name3,
    surname1, surname2, surname3 }) {
    // thumbnail canvas
    const img = new Image();

    img.onload = () => {
        context.drawImage(img, 0, 0, CONFIG.X / scale, CONFIG.Y / scale);

        // locations
        context.font = fontSmall;
        context.fillStyle = "white";
        context.fillText(`${location1} ${nation1}`.toUpperCase(), CONFIG.locationX / scale, CONFIG.location1Y / scale);
        context.fillText(`${location2} ${nation2}`.toUpperCase(), CONFIG.locationX / scale, CONFIG.location2Y / scale);
        context.fillText(`${location3} ${nation3}`.toUpperCase(), CONFIG.locationX / scale, CONFIG.location3Y / scale);

        // names
        context.font = fontLarge;
        context.fillStyle = "white";
        // context.fillText(`${name1}`.toUpperCase(), THUMBNAIL_CANVAS.nameX, THUMBNAIL_CANVAS.name1Y);
        // context.fillText(`${surname1}`.toUpperCase(), THUMBNAIL_CANVAS.nameX, THUMBNAIL_CANVAS.surname1Y);
        context.fillText(`${name2}`.toUpperCase(), CONFIG.nameX / scale, CONFIG.name2Y / scale);
        context.fillText(`${surname2}`.toUpperCase(), CONFIG.nameX / scale, CONFIG.surname2Y / scale);
        context.fillText(`${name3}`.toUpperCase(), CONFIG.nameX / scale, CONFIG.name3Y / scale);
        context.fillText(`${surname3}`.toUpperCase(), CONFIG.nameX / scale, CONFIG.surname3Y / scale);

        // flags
        const flagImage1 = new Image();
        flagImage1.src = `/img/flags/${nation1}.png`;
        flagImage1.onload = () => {
            context.drawImage(flagImage1, CONFIG.flagX / scale, CONFIG.flag1Y / scale, 92.15 / scale, 61.44 / scale);
        }
        const flagImage2 = new Image();
        flagImage2.src = `/img/flags/${nation2}.png`;
        flagImage2.onload = () => {
            context.drawImage(flagImage2, CONFIG.flagX / scale, CONFIG.flag2Y / scale, 92.15 / scale, 61.44 / scale);
        }
        const flagImage3 = new Image();
        flagImage3.src = `/img/flags/${nation3}.png`;
        flagImage3.onload = () => {
            context.drawImage(flagImage3, CONFIG.flagX / scale, CONFIG.flag3Y / scale, 92.15 / scale, 61.44 / scale);
        }
    }

    img.src = `/img/${bgImageName}.png`;
}