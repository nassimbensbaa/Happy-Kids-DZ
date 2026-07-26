export default async function handler(req, res) {

    //----------------------------------
    // CORS
    //----------------------------------

    res.setHeader("Access-Control-Allow-Origin", "*");

    res.setHeader(

        "Access-Control-Allow-Methods",

        "POST, OPTIONS"

    );

    res.setHeader(

        "Access-Control-Allow-Headers",

        "Content-Type"

    );

    //----------------------------------
    // OPTIONS
    //----------------------------------

    if (req.method === "OPTIONS") {

        return res.status(200).end();

    }

    //----------------------------------
    // POST فقط
    //----------------------------------

    if (req.method !== "POST") {

        return res.status(405).json({

            ok: false,

            error: "Method Not Allowed"

        });

    }

    try {

        //----------------------------------
        // رابط Google Apps Script
        //----------------------------------

        const GOOGLE_URL = process.env.GOOGLE_SCRIPT_URL;

        if (!GOOGLE_URL) {

            return res.status(500).json({

                ok: false,

                error: "GOOGLE_SCRIPT_URL is missing"

            });

        }

        //----------------------------------
        // البيانات القادمة من الموقع
        //----------------------------------

        const order = req.body;

        if (!order) {

            return res.status(400).json({

                ok: false,

                error: "No order data"

            });

        }
                //----------------------------------
        // إرسال الطلب إلى Google Apps Script
        //----------------------------------

        const response = await fetch(

            GOOGLE_URL,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify(order)

            }

        );

        //----------------------------------
        // قراءة الرد
        //----------------------------------

        let result = {};

        try {

            result = await response.json();

        }

        catch {

            return res.status(500).json({

                ok: false,

                error: "Invalid response from Google Apps Script"

            });

        }

        //----------------------------------
        // فشل Google Apps Script
        //----------------------------------

        if (!response.ok || result.ok !== true) {

            return res.status(500).json({

                ok: false,

                error: result.error || "Google Apps Script Error",

                result

            });

        }
                //----------------------------------
        // نجاح العملية
        //----------------------------------

        return res.status(200).json({

            ok: true,

            orderId: result.orderId || null,

            eventId: result.eventId || order.eventId || null,

            time: result.time || null,

            message: "Order saved successfully"

        });

    }

    catch (err) {

        console.error("SEND API ERROR:", err);

        return res.status(500).json({

            ok: false,

            error: err.message || "Internal Server Error"

        });

    }

}
