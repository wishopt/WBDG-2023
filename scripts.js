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
const formInputs = {
    deskId: document.getElementById("deskId"),
    user: document.getElementById("user"),
    email: document.getElementById("email"),
    start: document.getElementById("start"),
    end: document.getElementById("end"),
    studentId: document.getElementById("studentId")
};

let conversionRates;
let desksData;
let inputsValid;

async function displayAllDesks() {
    await updateDesksData();
    clearTable();
    generateTable(desksData);
}

function createBooking() {
    bookingForm.style["display"] = "block";
}

function submitBooking() {
    validateInputs();
    if (!inputsValid) {
        alert("Error while creating booking, please check your inputs.");
    }

    // api post on success
}

async function validateInputs() {
    await updateDesksData();
    if (checkDeskId(formInputs.deskId.value) 
        && checkName(formInputs.user.value)
        && checkEmail(formInputs.email.value) 
        && checkDate(formInputs.start.value)
        && checkDate(formInputs.end.value)
        && checkStudentId(formInputs.studentId.value)) 
        {
        return true;
    }
    return false;
}

function checkDeskId(id) {
    let validIds = []

    for (const desk of desksData) {
        validIds.push(desk.id);
    }
    return (validIds.includes(id) ? true : false)
}

function checkName(name) {
    // Only check if anything is filled in
    return name ? true : false;
}

function checkEmail(email) {
    const regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
    return regex.test(email);
}

function checkDate(date) {
    // Only invalid date is no date, because you can only create valid dates through the datetime-local input
    return date ? true : false;
}

function checkStudentId(id) {
    return /^\d+$/.test(id);
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
