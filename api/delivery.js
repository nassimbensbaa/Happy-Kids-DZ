export default async function handler(req, res) {

    res.setHeader("Access-Control-Allow-Origin", "*");

    try {

        const GOOGLE_URL = process.env.GOOGLE_SCRIPT_URL;

        const response = await fetch(
            GOOGLE_URL + "?action=delivery"
        );

        const data = await response.json();

        res.status(200).json(data);

    } catch (err) {

        res.status(500).json({
            ok: false,
            error: err.message
        });

    }

}