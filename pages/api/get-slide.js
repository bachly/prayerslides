import path from 'path';
const { registerFont, createCanvas, loadImage } = require('canvas')

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

const handler = async (req, res) => {
    return new Promise((resolve, reject) => {
        try {
            let {
                bgImageName,
                scale,
                location1, location2, location3,
                nation1, nation2, nation3,
                name1, name2, name3,
                surname1, surname2, surname3 } = req.query;

            scale = parseInt(scale) === 1 ? 1 : 3.84;

            // registerFont(fontPath, { family: 'CartooNature' })
            const canvas = createCanvas(CONFIG.X / scale, CONFIG.Y / scale);
            const context = canvas.getContext('2d');
            const bgImageFilePath = path.join(process.cwd(), `/public/img/${bgImageName}.png`);
            const fontSmall = scale === 1 ? "bold 31pt sans-serif" : "bold 8pt sans-serif";
            const fontLarge = scale === 1 ? "bold 50pt sans-serif" : "bold 13pt sans-serif";

            loadImage(bgImageFilePath).then((img) => {
                if (img) {
                    context.drawImage(img, 0, 0, CONFIG.X / scale, CONFIG.Y / scale);

                    // render locations
                    context.font = fontSmall;
                    context.fillStyle = "white";
                    context.fillText(`${location1} ${nation1}`.toUpperCase(), CONFIG.locationX / scale, CONFIG.location1Y / scale);
                    context.fillText(`${location2} ${nation2}`.toUpperCase(), CONFIG.locationX / scale, CONFIG.location2Y / scale);
                    context.fillText(`${location3} ${nation3}`.toUpperCase(), CONFIG.locationX / scale, CONFIG.location3Y / scale);

                    // render names
                    context.font = fontLarge;
                    context.fillStyle = "white";
                    // context.fillText(`${name1}`.toUpperCase(), THUMBNAIL_CANVAS.nameX, THUMBNAIL_CANVAS.name1Y);
                    // context.fillText(`${surname1}`.toUpperCase(), THUMBNAIL_CANVAS.nameX, THUMBNAIL_CANVAS.surname1Y);
                    context.fillText(`${name2}`.toUpperCase(), CONFIG.nameX / scale, CONFIG.name2Y / scale);
                    context.fillText(`${surname2}`.toUpperCase(), CONFIG.nameX / scale, CONFIG.surname2Y / scale);
                    context.fillText(`${name3}`.toUpperCase(), CONFIG.nameX / scale, CONFIG.name3Y / scale);
                    context.fillText(`${surname3}`.toUpperCase(), CONFIG.nameX / scale, CONFIG.surname3Y / scale);

                    // render flags
                    const flagImage1FilePath = path.join(process.cwd(), `/public/img/flags/${nation1}.png`);
                    loadImage(flagImage1FilePath).then(flagImage1 => {
                        context.drawImage(flagImage1, CONFIG.flagX / scale, CONFIG.flag1Y / scale, 92.15 / scale, 61.44 / scale);

                        const flagImage2FilePath = path.join(process.cwd(), `/public/img/flags/${nation2}.png`);
                        loadImage(flagImage2FilePath).then(flagImage2 => {
                            context.drawImage(flagImage2, CONFIG.flagX / scale, CONFIG.flag2Y / scale, 92.15 / scale, 61.44 / scale);

                            const flagImage3FilePath = path.join(process.cwd(), `/public/img/flags/${nation3}.png`);
                            loadImage(flagImage3FilePath).then(flagImage3 => {
                                context.drawImage(flagImage3, CONFIG.flagX / scale, CONFIG.flag3Y / scale, 92.15 / scale, 61.44 / scale);

                                // render to response
                                const buf3 = canvas.toBuffer('image/png');
                                res.setHeader('Content-Type', 'image/png');
                                res.send(buf3);
                                resolve();
                            })
                        })
                    })
                } else {
                    const defaultImageFilePath = path.join(process.cwd(), `/public/img/_default.png`);
                    loadImage(defaultImageFilePath).then((defaultImage) => {
                        context.drawImage(defaultImage, 0, 0, CONFIG.X / scale, CONFIG.Y / scale);

                        // render to response
                        const buf3 = canvas.toBuffer('image/png');
                        res.setHeader('Content-Type', 'image/png');
                        res.send(buf3);
                        resolve();
                    })
                }
            })
        } catch (err) {
            console.log('[API get-coloring-cover] Error (err):', err);
            res.status(400).json({ error: true, message: err.message });
            res.end();
            return resolve();
        }

        res.status(405).end();
        return resolve();
    })
};

export default handler;