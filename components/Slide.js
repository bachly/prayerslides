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
    image,
    location1, location2, location3, nation1, nation2, nation3,
    name1, name2, name3,
    surname1, surname2, surname3,
    onDownload,
    isDownloaded
}) {
    const canvasRef = useRef();
    const downloadCanvasRef = useRef();
    const downloadLinkRef = useRef();
    const [downloadDataUrl, setDownloadDataUrl] = useState(null);

    useEffect(() => {
        const context = canvasRef.current.getContext("2d");
        renderSlide({
            context,
            scale: SCALE_FACTOR,
            fontSmall: "bold 8pt sans-serif",
            fontLarge: "bold 13pt sans-serif",
            image,
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
            image,
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

    return <>
        <canvas className="" ref={canvasRef} width={CONFIG.X / SCALE_FACTOR} height={CONFIG.Y / SCALE_FACTOR} />
        <canvas className="hidden" ref={downloadCanvasRef} width={CONFIG.X} height={CONFIG.Y} />
        <div className="px-4 py-2 flex justify-center items-center">
            <button className={clsx("px-4 py-1 rounded-sm duration-300 transition",
                isDownloaded ? "bg-green-100 border border-green-400 hover:bg-green-200" : "bg-neutral-200 border border-neutral-400 hover:bg-neutral-300")} onClick={handleDownload}>
                {isDownloaded ?
                    <div className="text-green-600 ml-2 text-sm flex items-center">
                        Downloaded <AiOutlineCheckCircle size="20" className="ml-1" />
                    </div> :
                    <div className="text-neutral-800 ml-2 text-sm flex items-center">
                        Download <AiOutlineDownload size="20" className="ml-1" />
                    </div>
                }
            </button>

        </div>
        <div className="px-4">
            <div className="flex items-center">
                <img className="w-6 mr-2" src={`/img/flags/${nation1}.png`} />
                {name1} {surname1} - {location1} {nation1}
            </div>
            <div className="flex items-center">
                <img className="w-6 mr-2" src={`/img/flags/${nation2}.png`} />
                {name2} {surname2} - {location2} {nation2}
            </div>
            <div className="flex items-center">
                <img className="w-6 mr-2" src={`/img/flags/${nation3}.png`} />
                {name3} {surname3} - {location3} {nation3}
            </div>
        </div>
        <a className="hidden"
            ref={downloadLinkRef}
            href={downloadDataUrl}
            download={`${id}. Prayer Slide ${name1}.jpeg`}>Download Link</a>
    </>
}

function renderSlide({ context, scale = 1, fontSmall, fontLarge, image,
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

    img.src = image;
}