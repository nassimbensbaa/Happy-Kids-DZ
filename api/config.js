export default function handler(req, res) {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");

    res.status(200).json({

        META_PIXEL_ID: process.env.META_PIXEL_ID || ""

    });

}
