import crypto from "crypto";

export default async function handler(req, res) {

    //----------------------------------
    // CORS
    //----------------------------------

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

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
        // Environment Variables
        //----------------------------------

        const PIXEL_ID = process.env.META_PIXEL_ID;
        const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
        const TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE || "";

        if (!PIXEL_ID) {

            return res.status(500).json({

                ok: false,
                error: "META_PIXEL_ID is missing"

            });

        }

        if (!ACCESS_TOKEN) {

            return res.status(500).json({

                ok: false,
                error: "META_ACCESS_TOKEN is missing"

            });

        }

        //----------------------------------
        // Request Body
        //----------------------------------

        const {

            eventName,
            eventId,
            productName,
            value,
            currency,
            phone,
            pageUrl,
            userAgent,
            fbp,
            fbc

        } = req.body;
                //----------------------------------
        // Client IP
        //----------------------------------

        const clientIp =
            (req.headers["x-forwarded-for"] || "")
                .split(",")[0]
                .trim()
            ||
            req.socket?.remoteAddress
            ||
            "";

        //----------------------------------
        // SHA256 Phone
        //----------------------------------

        let phoneHash = "";

        if (phone) {

            const normalizedPhone = String(phone)
                .replace(/\s+/g, "")
                .replace(/-/g, "");

            phoneHash = crypto
                .createHash("sha256")
                .update(normalizedPhone)
                .digest("hex");

        }

        //----------------------------------
        // Event Object
        //----------------------------------

        const event = {

            event_name: eventName,

            event_time: Math.floor(Date.now() / 1000),

            event_id: eventId,

            action_source: "website",

            event_source_url: pageUrl,

            user_data: {

                client_ip_address: clientIp,

                client_user_agent: userAgent,

                ...(phoneHash && {

                    ph: [phoneHash]

                }),

                ...(fbp && {

                    fbp

                }),

                ...(fbc && {

                    fbc

                })

            },

            custom_data: {

                value: Number(value || 0),

                currency: currency || "DZD",

                content_name: productName || "",

                content_type: "product"

            }

        };

        //----------------------------------
        // Request Body to Meta
        //----------------------------------

        const body = {

            data: [

                event

            ]

        };

        //----------------------------------
        // Test Event Code (اختياري)
        //----------------------------------

        if (TEST_EVENT_CODE) {

            body.test_event_code = TEST_EVENT_CODE;

        }
                //----------------------------------
        // إرسال الحدث إلى Meta
        //----------------------------------

        const response = await fetch(

            `https://graph.facebook.com/v23.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify(body)

            }

        );

        //----------------------------------
        // قراءة استجابة Meta
        //----------------------------------

        const result = await response.json();

        console.log("===== META RESPONSE =====");

        console.log(JSON.stringify(result, null, 2));

        //----------------------------------
        // في حالة وجود خطأ
        //----------------------------------

        if (!response.ok) {

            console.error("===== META API ERROR =====");

            console.error(JSON.stringify(result, null, 2));

            return res.status(response.status).json({

                ok: false,

                error: "Meta Graph API Error",

                meta: result

            });

        }

        //----------------------------------
        // نجاح الإرسال
        //----------------------------------

        return res.status(200).json({

            ok: true,

            message: "Event sent successfully",

            eventId,

            meta: result

        });
    }

    //----------------------------------
    // معالجة الأخطاء
    //----------------------------------

    catch (err) {

        console.error("===== META FUNCTION ERROR =====");
        console.error(err);

        return res.status(500).json({

            ok: false,

            error: err.message,

            stack:
                process.env.NODE_ENV === "development"
                    ? err.stack
                    : undefined

        });

    }

}
