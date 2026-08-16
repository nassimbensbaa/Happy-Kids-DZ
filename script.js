let products = [];
let deliveryData = [];
let PRODUCT_PRICE = 0;
let selectedProduct = null;

/*=================================
Meta
=================================*/

function generateEventId() {

    if (window.crypto && crypto.randomUUID) {

        return crypto.randomUUID();

    }

    return "event_" + Date.now() + "_" + Math.random().toString(36).substring(2);

}

function getCookie(name) {

    const value =
        "; " + document.cookie;

    const parts =
        value.split("; " + name + "=");

    if (parts.length === 2) {

        return parts.pop().split(";").shift();

    }

    return "";

}

async function trackEvent(eventName, data = {}) {

    const eventId =
        generateEventId();

    //--------------------------------
    // Meta Pixel
    //--------------------------------

    if (typeof fbq !== "undefined") {

        fbq(

            "track",

            eventName,

            {

                content_name:
                    data.content_name || "",

                value:
                    Number(data.value || 0),

                currency:
                    data.currency || "DZD"

            },

            {

                eventID:
                    eventId

            }

        );

    }

    //--------------------------------
    // Meta Conversions API
    //--------------------------------

    try {

        await fetch("/api/meta", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                eventName,

                eventId,

                value:
                    Number(data.value || 0),

                currency:
                    data.currency || "DZD",

                productName:
                    data.content_name || "",

                phone:
                    data.phone || "",

                pageUrl:
                    window.location.href,

                userAgent:
                    navigator.userAgent,

                fbp:
                    getCookie("_fbp"),

                fbc:
                    getCookie("_fbc")

            })

        });

    }

    catch (err) {

        console.error(err);

    }

    return eventId;

}
//================================
// تحميل المنتجات
//================================
async function loadProducts() {

    try {

        const res = await fetch("/api/products");

        products = await res.json();

        let html = "";

        products.forEach((p, index) => {

            html += `
                <button
                    class="category-btn"
                    onclick="selectProduct(${index},this)">
                    ${p.name}
                </button>
            `;

        });

        document.getElementById("categories").innerHTML = html;

        //--------------------------------
        // اختيار أول تصميم تلقائياً
        //--------------------------------

        if (products.length > 0) {

            const firstButton =
                document.querySelector(".category-btn");

            await selectProduct(

                0,

                firstButton

            );

        }

    }

    catch (err) {

        console.error(err);

        alert("تعذر تحميل المنتجات");

    }

}

//================================
// اختيار منتج
//================================
async function selectProduct(index, btn) {

    selectedProduct =
        products[index];

    PRODUCT_PRICE =
        Number(selectedProduct.price);

    //--------------------------------
    // إرسال ViewContent
    //--------------------------------

    await trackEvent(

        "ViewContent",

        {

            content_name:
                selectedProduct.name,

            value:
                PRODUCT_PRICE,

            currency:
                "DZD"

        }

    );

    //--------------------------------
    // تغيير الصورة
    //--------------------------------

    const img =
        document.getElementById("mainImage");

    img.style.opacity = "0";

    img.src =
        "images/" + selectedProduct.image;

    img.onload = function () {

        img.style.opacity = "1";

    };

    //--------------------------------
    // تحديث الأسعار
    //--------------------------------

    document.getElementById("productPrice").textContent =
        PRODUCT_PRICE;

    document.getElementById("priceValue").textContent =
        PRODUCT_PRICE;

    //--------------------------------
    // الزر النشط
    //--------------------------------

    document
        .querySelectorAll(".category-btn")
        .forEach(button => {

            button.classList.remove("active");

        });

    if (btn) {

        btn.classList.add("active");

    }

    //--------------------------------
    // تحديث المجموع
    //--------------------------------

    updateTotal();

}
//================================
// تحميل أسعار التوصيل
//================================
async function loadDelivery() {

    try {

        const res =
            await fetch("/api/delivery");

        deliveryData =
            await res.json();

        let html =
            '<option value="">اختر الولاية</option>';

        deliveryData.forEach(item => {

            html += `
                <option value="${item.name}">
                    ${item.name}
                </option>
            `;

        });

        document.getElementById("wilaya").innerHTML =
            html;

    }

    catch (err) {

        console.error(err);

        alert("تعذر تحميل أسعار التوصيل");

    }

}

//================================
// تحديث الأسعار عند تغيير الولاية
//================================
document.addEventListener("change", function (e) {

    if (

        e.target.id === "wilaya"

        ||

        e.target.id === "deliveryType"

    ) {

        updateTotal();

    }

});

//================================
// حساب السعر الإجمالي
//================================
function updateTotal() {

    let deliveryPrice = 0;

    const wilaya =
        document.getElementById("wilaya").value;

    const deliveryType =
        document.getElementById("deliveryType").value;

    const row =
        deliveryData.find(item => item.name === wilaya);

    if (row) {

        if (deliveryType === "home") {

            deliveryPrice =
                Number(row.home);

        }

        else {

            deliveryPrice =
                Number(row.office);

        }

    }

    document.getElementById("deliveryPrice").textContent =
        deliveryPrice;

    document.getElementById("totalPrice").textContent =
        PRODUCT_PRICE + deliveryPrice;

}

//================================
// إعادة تعيين النموذج
//================================
function resetForm() {

    document.getElementById("recipientName").value = "";

    document.getElementById("fullName").value = "";

    document.getElementById("phone").value = "";

    document.getElementById("officeName").value = "";

    document.getElementById("notes").value = "";

    document.getElementById("wilaya").selectedIndex = 0;

    document.getElementById("deliveryType").selectedIndex = 0;

    updateTotal();

}
//================================
// إرسال الطلب
//================================
async function sendOrder() {

    //--------------------------------
    // التحقق من اختيار المنتج
    //--------------------------------

    if (selectedProduct == null) {

        alert("اختر نوع التصميم");

        return;

    }

    //--------------------------------
    // قراءة البيانات
    //--------------------------------

    const recipientName =
        document.getElementById("recipientName").value.trim();

    const fullName =
        document.getElementById("fullName").value.trim();

    const phone =
        document.getElementById("phone").value.trim();

    const wilaya =
        document.getElementById("wilaya").value;

    const deliveryType =
        document.getElementById("deliveryType").value;

    const officeName =
        document.getElementById("officeName").value.trim();

    const notes =
        document.getElementById("notes").value.trim();

    //--------------------------------
    // التحقق من الحقول
    //--------------------------------

    if (recipientName === "") {

        alert("أدخل اسم الناجح");

        return;

    }

    if (fullName === "") {

        alert("أدخل الاسم الكامل");

        return;

    }

    if (phone === "") {

        alert("أدخل رقم الهاتف");

        return;

    }

    const phoneRegex =
        /^(05|06|07)[0-9]{8}$/;

    if (!phoneRegex.test(phone)) {

        alert("يرجى إدخال رقم هاتف صحيح");

        return;

    }

    if (wilaya === "") {

        alert("اختر الولاية");

        return;

    }

    //--------------------------------
    // حساب سعر التوصيل
    //--------------------------------

    const row =
        deliveryData.find(x => x.name === wilaya);

    const deliveryPrice =
        deliveryType === "home"
            ? Number(row.home)
            : Number(row.office);

    const total =
        PRODUCT_PRICE + deliveryPrice;

    //--------------------------------
    // إرسال InitiateCheckout
    //--------------------------------

    const eventId =
        await trackEvent(

            "InitiateCheckout",

            {

                content_name:
                    selectedProduct.name,

                value:
                    total,

                currency:
                    "DZD",

                phone:
                    phone

            }

        );

    //--------------------------------
    // تجهيز بيانات الطلب
    //--------------------------------

    const orderData = {

        eventId,

        productName:
            selectedProduct.name,

        image:
            selectedProduct.image,

        recipientName,

        notes,

        fullName,

        phone,

        wilaya,

        deliveryType,

        officeName,

        productPrice:
            PRODUCT_PRICE,

        deliveryPrice,

        total

    };

    try {

        //--------------------------------
        // إرسال الطلب
        //--------------------------------

        const response =
            await fetch(

                "/api/send",

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(orderData)

                }

            );

        const result =
            await response.json();
                //--------------------------------
        // نجاح إرسال الطلب
        //--------------------------------

        if (response.ok && result.ok) {

            //--------------------------------
            // إرسال Purchase
            //--------------------------------

            await trackEvent(

                "Purchase",

                {

                    content_name:
                        selectedProduct.name,

                    value:
                        total,

                    currency:
                        "DZD",

                    phone:
                        phone

                }

            );

            //--------------------------------
            // نافذة النجاح
            //--------------------------------

            document.getElementById("successModal").style.display =
                "flex";

            //--------------------------------
            // إعادة تعيين النموذج
            //--------------------------------

            resetForm();

            //--------------------------------
            // العودة لأول منتج
            //--------------------------------

            if (products.length > 0) {

                const firstButton =
                    document.querySelector(".category-btn");

                await selectProduct(

                    0,

                    firstButton

                );

            }

        }

        else {

            alert(result.error || "فشل إرسال الطلب");

        }

    }

    catch (err) {

        console.error(err);

        alert("حدث خطأ أثناء إرسال الطلب");

    }

}

//================================
// إغلاق نافذة النجاح
//================================
function closeModal() {

    document.getElementById("successModal").style.display =
        "none";

}

//================================
// تشغيل الموقع
//================================
window.onload = async function () {

    //--------------------------------
    // تحميل البيانات
    //--------------------------------

    await loadDelivery();

    await loadProducts();

    updateTotal();

    //--------------------------------
    // إرسال PageView
    //--------------------------------

    await trackEvent(

        "PageView",

        {

            value: 0,

            currency: "DZD"

        }

    );

};
