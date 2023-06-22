const baseURL = "https://matthiasbaldauf.com/wbdg23";
const conversionRateURL = "https://api.exchangerate.host/latest";

const desksTable = document.getElementById("desksTable");
const bookingForm = document.getElementById("bookingForm");
const buttons = {
    displayAllDesks: document.getElementById("btnDisplayAllDesks"),
    newBooking: document.getElementById("btnNewBooking"),
    submitBooking: document.getElementById("submitBooking"),
    allBookings: document.getElementById("btnMyBookings")
};

const form = document.getElementById("bookingForm")

let conversionRates;
let desksData;
let inputsValid = false;
let bookingData;

async function displayAllDesks() {
    await updateDesksData();
    clearTable();
    generateTable(desksData);
}

function createBooking() {
    bookingForm.style["display"] = "block";
}

async function submitBooking() {
    bookingData = new FormData(form);
    bookingData.set("start", bookingData.get("start") + ":00")
    bookingData.set("end", bookingData.get("end") + ":00")

    await validateInputs();
    if (!inputsValid) {
        alert("Error while creating booking, please check your inputs.");
        return;
    }

    sendBookingData(bookingData);

    // ToDo: Notify user of successful booking, save in "my bookings"
}

async function sendBookingData(bookingData) {

    const response = await fetch(baseURL + "/booking", {
        method: "POST",
        body: bookingData
    });

    let responseData = await response.json();
    console.log(responseData);
    
}

async function validateInputs() {
    await updateDesksData();
    console.log(bookingData.get("start"))
    if (checkDeskId(bookingData.get("deskid")) 
        && checkName(bookingData.get("user"))
        && checkEmail(bookingData.get("email")) 
        && checkDate(bookingData.get("start"))
        && checkDate(bookingData.get("end"))
        && checkStudentId(bookingData.get("studid"))) 
        {
        inputsValid = true;
        return
    }
    inputsValid = false;
}

function checkDeskId(id) {
    let validIds = []

    for (const desk of desksData) {
        validIds.push(desk.id);
    }

    if (!validIds.includes(id)) {
        alert("Please check the desk ID.");
        return false;
    }
    return true;
}

function checkName(name) {
    // Only check if anything is filled in
    if (!name) {
        alert("Please make sure you input a name.");
        return false;
    }
    return true;
}

function checkEmail(email) {
    const regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
    if (!regex.test(email)) {
        alert("Please check your e-mail address.");
        return false;
    }
    return true;
}

function checkDate(date) {
    // Only invalid date is no date, because you can only create valid dates through the datetime-local input
    if (!date) {
        alert("Please check your start and end date.");
        return false;
    }
    return true;
}

function checkStudentId(id) {
    if(!/^\d+$/.test(id)) {
        alert("Please check your student ID.");
        return false;
    }
    return true;
}

async function updateDesksData() {
    const response = await fetch(baseURL + "/desks");
    desksData = await response.json();
}

function clearTable() {
    while (desksTable.firstChild) {
        desksTable.removeChild(desksTable.firstChild);
    }
}

async function generateTable(data) {
    let table = document.createElement("table");
    table.appendChild(generateTableHead(data[0]));

    for (const property of data) {
        let row = document.createElement("tr");
        for (const [key, value] of Object.entries(property)) {
            let cell = document.createElement("td");
            if (key == "available") {
                cell.innerHTML = (value == 1 ? "available" : "unavailable");
            } else if (key == "price") {
                await updateConversionRates(); 
                cell.innerHTML = value + " CHF / " + Math.round((value / conversionRates.rates.CHF) * 100) / 100 + " EUR";
            } else {
                cell.innerHTML = value;
            };
            row.appendChild(cell);
        };
        table.appendChild(row);
    };

    desksTable.appendChild(table);
}

function generateTableHead() {
    let tableHead = document.createElement("tr");
    let properties = ["ID", "Name", "Status", "Address", "Price / Hour", "Latitude", "Longitude", "Comment"];

    for (const property of properties) {
        let th = document.createElement("th");
        th.innerHTML = property;
        tableHead.appendChild(th);
    };

    return tableHead;
}

async function updateConversionRates() {
    const response = await fetch(conversionRateURL);
    const currentRates = await response.json();
    conversionRates = currentRates;
}

buttons.displayAllDesks.addEventListener("click", displayAllDesks);
buttons.submitBooking.addEventListener("click", submitBooking)
buttons.newBooking.addEventListener("click", createBooking);

displayAllDesks();
