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

    return "event_" + Date.now() + "_" +
        Math.random().toString(36).substring(2);
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

        await fetch(
            "/api/meta",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
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
            }
        );

    }

    catch (err) {

        console.error(
            "Meta API Error:",
            err
        );

    }


    return eventId;

}



/*================================
 تحميل المنتجات من products.json
================================*/

async function loadProducts() {

    try {

        const response = await fetch("/products/products.json", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status} - ${response.statusText}`
            );
        }

        products = await response.json();

        if (!Array.isArray(products)) {
            throw new Error("products.json يجب أن يحتوي على Array");
        }

        console.log("تم تحميل المنتجات:", products);

        let html = "";

        products.forEach((p, index) => {

            html += `
                <button
                    class="category-btn image-thumb"
                    data-index="${index}"
                    aria-label="عرض ${p.name}"
                    title="${p.name}">

                    <img
                        src="images/${p.image}"
                        alt="${p.name}"
                        loading="lazy">

                    <span>${p.name}</span>

                </button>
            `;

        });

        const categories =
            document.getElementById("categories");

        if (categories) {
            categories.innerHTML = html;
        }

        /* اختيار أول منتج */

        if (products.length > 0) {

            const firstButton =
                document.querySelector(".category-btn");

            await selectProduct(
                0,
                firstButton
            );

        }

    }

    catch (error) {

        console.error(
            "خطأ في تحميل products.json:",
            error
        );

        alert(
            "تعذر تحميل المنتجات من products.json"
        );

    }

}


/*================================
 اختيار منتج
================================*/

let currentImageIndex = 0;

function getImagePath(product) {
    const imagePath = String(product?.image || "").replace(/^\/+/, "");
    return imagePath.startsWith("images/") ? imagePath : "images/" + imagePath;
}

function updateMainImage(index) {
    const img = document.getElementById("mainImage");
    if (!img || !products[index]) return;

    currentImageIndex = index;
    img.style.opacity = "0.35";
    img.src = getImagePath(products[index]);
    img.alt = products[index].name || "صورة الكتاب";

    img.onload = function () {
        img.style.opacity = "1";
    };

    img.onerror = function () {
        console.error("تعذر تحميل الصورة:", img.src);
        img.style.opacity = "1";
    };
}

function changeImage(step) {
    if (!products.length) return;

    let nextIndex = currentImageIndex + step;
    if (nextIndex < 0) nextIndex = products.length - 1;
    if (nextIndex >= products.length) nextIndex = 0;

    const btn = document.querySelector(`.category-btn[data-index="${nextIndex}"]`);
    selectProduct(nextIndex, btn);
}

function setupImageViewer() {
    const viewer = document.getElementById("imageViewer");
    const img = document.getElementById("mainImage");
    const prev = document.getElementById("prevImage");
    const next = document.getElementById("nextImage");
    const hint = document.getElementById("swipeHint");
    const categories = document.getElementById("categories");

    if (!viewer || !img) return;

    prev?.addEventListener("click", () => changeImage(-1));
    next?.addEventListener("click", () => changeImage(1));

    // الضغط على أي صورة مصغرة يغيّر الصورة الكبيرة مباشرة
    categories?.addEventListener("click", function (e) {
        const button = e.target.closest(".image-thumb");
        if (!button) return;
        const index = Number(button.dataset.index);
        if (Number.isInteger(index)) selectProduct(index, button);
    });

    let startX = 0;
    let startY = 0;
    let dragging = false;

    const finishSwipe = (clientX, clientY) => {
        if (!dragging) return;
        dragging = false;
        const dx = clientX - startX;
        const dy = clientY - startY;

        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
            changeImage(dx < 0 ? 1 : -1);
        }
    };

    viewer.addEventListener("pointerdown", function (e) {
        if (e.target.closest("button")) return;
        dragging = true;
        startX = e.clientX;
        startY = e.clientY;
        viewer.setPointerCapture?.(e.pointerId);
    });

    viewer.addEventListener("pointerup", function (e) {
        finishSwipe(e.clientX, e.clientY);
    });

    viewer.addEventListener("pointercancel", function () {
        dragging = false;
    });

    // إخفاء التلميح بعد أول استعمال، مع بقائه ظاهرًا عند فتح الصفحة
    viewer.addEventListener("click", function () {
        hint?.classList.add("used");
    });
}

async function selectProduct(index, btn) {

    selectedProduct = products[index];

    if (!selectedProduct) return;

    // حفظ رقم الصورة الحالية لاستخدام أزرار التنقل والسحب
    currentImageIndex = index;

    PRODUCT_PRICE = Number(selectedProduct.price || 0);

    updateMainImage(index);

    try {
        await trackEvent(
            "ViewContent",
            {
                content_name: selectedProduct.name,
                value: PRODUCT_PRICE,
                currency: "DZD"
            }
        );
    } catch (e) {
        console.warn("ViewContent tracking error:", e);
    }

    document.querySelectorAll(".category-btn").forEach(function (item) {
        item.classList.remove("active");
    });

    const activeButton = btn || document.querySelector(`.category-btn[data-index="${index}"]`);
    if (activeButton) {
        activeButton.classList.add("active");
        activeButton.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }

    //--------------------------------
    // تحديث الأسعار
    //--------------------------------

    const productPrice =
        document.getElementById(
            "productPrice"
        );

    if (productPrice) {

        productPrice.textContent =
            PRODUCT_PRICE;

    }


    const priceValue =
        document.getElementById(
            "priceValue"
        );

    if (priceValue) {

        priceValue.textContent =
            PRODUCT_PRICE;

    }


    //--------------------------------
    // الزر النشط
    //--------------------------------

    document
        .querySelectorAll(
            ".category-btn"
        )
        .forEach(button => {

            button.classList.remove(
                "active"
            );

        });


    if (btn) {

        btn.classList.add(
            "active"
        );

    }


    //--------------------------------
    // تحديث المجموع
    //--------------------------------

    updateTotal();

}


/*================================
 تحميل أسعار التوصيل
================================*/

async function loadDelivery() {

    try {

        const res =
            await fetch("/api/delivery");


        deliveryData =
            await res.json();


        let html =
            '<option value="">اختر الولاية</option>';


        deliveryData.forEach(
            item => {

                html += `
                    <option value="${item.name}">
                        ${item.name}
                    </option>
                `;

            }
        );


        const wilaya =
            document.getElementById(
                "wilaya"
            );


        if (wilaya) {

            wilaya.innerHTML =
                html;

        }

    }

    catch (err) {

        console.error(err);

        alert(
            "تعذر تحميل أسعار التوصيل"
        );

    }

}


/*================================
 تحديث الأسعار عند تغيير الولاية
================================*/

document.addEventListener(
    "change",
    function (e) {

        if (
            e.target.id === "wilaya" ||
            e.target.id === "deliveryType"
        ) {

            updateTotal();

        }

    }
);


/*================================
 حساب السعر الإجمالي
================================*/

function updateTotal() {

    let deliveryPrice = 0;


    const wilayaElement =
        document.getElementById(
            "wilaya"
        );


    const deliveryTypeElement =
        document.getElementById(
            "deliveryType"
        );


    if (
        !wilayaElement ||
        !deliveryTypeElement
    ) {

        return;

    }


    const wilaya =
        wilayaElement.value;


    const deliveryType =
        deliveryTypeElement.value;


    const row =
        deliveryData.find(
            item =>
                item.name === wilaya
        );


    if (row) {

        if (
            deliveryType === "home"
        ) {

            deliveryPrice =
                Number(
                    row.home || 0
                );

        }

        else {

            deliveryPrice =
                Number(
                    row.office || 0
                );

        }

    }


    const deliveryPriceElement =
        document.getElementById(
            "deliveryPrice"
        );


    if (deliveryPriceElement) {

        deliveryPriceElement.textContent =
            deliveryPrice;

    }


    const totalPriceElement =
        document.getElementById(
            "totalPrice"
        );


    if (totalPriceElement) {

        totalPriceElement.textContent =
            PRODUCT_PRICE +
            deliveryPrice;

    }

}


/*================================
 إعادة تعيين النموذج
================================*/

function resetForm() {


    const recipientName =
        document.getElementById(
            "recipientName"
        );


    if (recipientName) {

        recipientName.value = "";

    }


    const fullName =
        document.getElementById(
            "fullName"
        );


    if (fullName) {

        fullName.value = "";

    }


    const phone =
        document.getElementById(
            "phone"
        );


    if (phone) {

        phone.value = "";

    }


    const officeName =
        document.getElementById(
            "officeName"
        );


    if (officeName) {

        officeName.value = "";

    }


    const notes =
        document.getElementById(
            "notes"
        );


    if (notes) {

        notes.value = "";

    }


    const wilaya =
        document.getElementById(
            "wilaya"
        );


    if (wilaya) {

        wilaya.selectedIndex = 0;

    }


    const deliveryType =
        document.getElementById(
            "deliveryType"
        );


    if (deliveryType) {

        deliveryType.selectedIndex = 0;

    }


    updateTotal();

}


/*================================
 إرسال الطلب
================================*/

async function sendOrder() {


    //--------------------------------
    // التحقق من اختيار المنتج
    //--------------------------------

    if (selectedProduct == null) {

        alert(
            "اختر نوع التصميم"
        );

        return;

    }


    //--------------------------------
    // قراءة البيانات
    //--------------------------------

    const recipientName =
        document.getElementById(
            "recipientName"
        ).value.trim();


    const fullName =
        document.getElementById(
            "fullName"
        ).value.trim();


    //--------------------------------
    // دمج الاسم واللقب
    //--------------------------------

    const nameAndSurname =
        (
            recipientName +
            " " +
            fullName
        ).trim();


    const phone =
        document.getElementById(
            "phone"
        ).value.trim();


    const wilaya =
        document.getElementById(
            "wilaya"
        ).value;


    const deliveryType =
        document.getElementById(
            "deliveryType"
        ).value;


    const officeName =
        document.getElementById(
            "officeName"
        ).value.trim();


    const notes =
        document.getElementById(
            "notes"
        ).value.trim();


    //--------------------------------
    // التحقق من الاسم
    //--------------------------------

    if (recipientName === "") {

        alert(
            "أدخل الاسم"
        );

        return;

    }


    //--------------------------------
    // التحقق من اللقب
    //--------------------------------

    if (fullName === "") {

        alert(
            "أدخل اللقب"
        );

        return;

    }


    //--------------------------------
    // التحقق من الهاتف
    //--------------------------------

    if (phone === "") {

        alert(
            "أدخل رقم الهاتف"
        );

        return;

    }


    const phoneRegex =
        /^(05|06|07)[0-9]{8}$/;


    if (
        !phoneRegex.test(phone)
    ) {

        alert(
            "يرجى إدخال رقم هاتف صحيح"
        );

        return;

    }


    //--------------------------------
    // التحقق من الولاية
    //--------------------------------

    if (wilaya === "") {

        alert(
            "اختر الولاية"
        );

        return;

    }


    //--------------------------------
    // حساب سعر التوصيل
    //--------------------------------

    const row =
        deliveryData.find(
            x =>
                x.name === wilaya
        );


    if (!row) {

        alert(
            "تعذر تحديد سعر التوصيل"
        );

        return;

    }


    let deliveryPrice = 0;


    if (
        deliveryType === "home"
    ) {

        deliveryPrice =
            Number(
                row.home || 0
            );

    }

    else {

        deliveryPrice =
            Number(
                row.office || 0
            );

    }


    const total =
        PRODUCT_PRICE +
        deliveryPrice;


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
    // ملاحظة:
    // eventId لا يتم إرساله إلى Google Sheets
    // recipientName و fullName يتم دمجهما
    //--------------------------------

    const orderData = {

        productName:
            selectedProduct.name,

        image:
            selectedProduct.image,

        fullName:
            nameAndSurname,

        notes:
            notes,

        phone:
            phone,

        wilaya:
            wilaya,

        deliveryType:
            deliveryType,

        officeName:
            officeName,

        productPrice:
            PRODUCT_PRICE,

        deliveryPrice:
            deliveryPrice,

        total:
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
                        JSON.stringify(
                            orderData
                        )

                }
            );


        //--------------------------------
        // قراءة النتيجة
        //--------------------------------

        const result =
            await response.json();


        //--------------------------------
        // نجاح إرسال الطلب
        //--------------------------------

        if (
            response.ok &&
            result.ok
        ) {


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

            const successModal =
                document.getElementById(
                    "successModal"
                );


            if (successModal) {

                successModal.style.display =
                    "flex";

            }


            //--------------------------------
            // إعادة تعيين النموذج
            //--------------------------------

            resetForm();


            //--------------------------------
            // العودة لأول منتج
            //--------------------------------

            if (
                products.length > 0
            ) {

                const firstButton =
                    document.querySelector(
                        ".category-btn"
                    );


                await selectProduct(
                    0,
                    firstButton
                );

            }


        }

        else {

            alert(
                result.error ||
                "فشل إرسال الطلب"
            );

        }

    }


    catch (err) {

        console.error(
            "Order Error:",
            err
        );

        alert(
            "حدث خطأ أثناء إرسال الطلب"
        );

    }

}


/*================================
 إغلاق نافذة النجاح
================================*/

function closeModal() {

    const modal =
        document.getElementById(
            "successModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }

}


/*================================
 تشغيل الموقع
================================*/

window.onload =
    async function () {


        //--------------------------------
        // تحميل البيانات
        //--------------------------------

        setupImageViewer();

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

