import clsx from "clsx";
import Image from "next/image";
import { useEffect, useRef, useState } from "react"
import { AiOutlineCheckCircle, AiOutlineDownload } from "react-icons/ai";

export default function SlideImage({
    id,
    bgImageName,
    location1, location2, location3, nation1, nation2, nation3,
    name1, name2, name3,
    surname1, surname2, surname3,
    onDownload,
    isDownloaded
}) {
    const downloadLinkRef = useRef();
    const [downloadDataUrl, setDownloadDataUrl] = useState(null);

    const imageSrc = `/api/get-slide`
        + `?bgImageName=${bgImageName}`
        + `&location1=${encodeURIComponent(location1)}`
        + `&location2=${encodeURIComponent(location2)}`
        + `&location3=${encodeURIComponent(location3)}`
        + `&nation1=${encodeURIComponent(nation1)}`
        + `&nation2=${encodeURIComponent(nation2)}`
        + `&nation3=${encodeURIComponent(nation3)}`
        + `&name1=${encodeURIComponent(name1)}`
        + `&name2=${encodeURIComponent(name2)}`
        + `&name3=${encodeURIComponent(name3)}`
        + `&surname1=${encodeURIComponent(surname1)}`
        + `&surname2=${encodeURIComponent(surname2)}`
        + `&surname3=${encodeURIComponent(surname3)}`;

    const fullSizeImageSrc = `${imageSrc}&scale=1`;

    function handleDownload(event) {
        event && event.preventDefault();
        setTimeout(() => {
            setDownloadDataUrl(fullSizeImageSrc);
            onDownload();
        }, 500)
    }

    useEffect(() => {
        if (downloadLinkRef.current) {
            downloadLinkRef.current.click();
            setDownloadDataUrl(null);
        }
    }, [downloadDataUrl])

    return <div data-image-src={imageSrc}>
        <a className="hidden"
            ref={downloadLinkRef}
            href={downloadDataUrl}
            download={`${id}. Prayer Slide ${name1}.jpeg`}>Hidden Download Link</a>

        <Image src={imageSrc} width="500" height="281.25" />

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
                {name1} - {location1} {nation1}
            </div>
            <div className="flex items-center">
                <img className="w-6 mr-2" src={`/img/flags/${nation2}.png`} />
                {name2} - {location2} {nation2}
            </div>
            <div className="flex items-center">
                <img className="w-6 mr-2" src={`/img/flags/${nation3}.png`} />
                {name3} - {location3} {nation3}
            </div>
        </div>
    </div>
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