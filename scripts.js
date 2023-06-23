const baseURL = "https://matthiasbaldauf.com/wbdg23";
const conversionRateURL = "https://api.exchangerate.host/latest";

const desksTable = document.getElementById("desksTable");
const bookingForm = document.getElementById("bookingForm");
const buttons = {
    displayAllDesks: document.getElementById("btnDisplayAllDesks"),
    newBooking: document.getElementById("btnNewBooking"),
    submitBooking: document.getElementById("btnSubmitBooking"),
    timeslots: document.getElementById("btnTimeslots")
};

const studId = document.getElementById("studid");
const idDropdown = document.getElementById("deskid");
const form = document.getElementById("bookingForm");

let conversionRates;
let desksData;
let inputsValid = false;
let bookingData;
let bookings;

async function displayAllDesks() {
    await updateDesksData();
    clearTable();
    generateTable(desksData, ["ID", "Name", "Status", "Address", "Price / Hour", "Latitude", "Longitude", "Comment"]);
}

function createBooking() {
    for (let desk of desksData) {
        let dropdownOption = document.createElement("option");
        dropdownOption.value = desk.id;
        dropdownOption.textContent = desk.id;
        idDropdown.appendChild(dropdownOption);
    }
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

    await sendBookingData(bookingData);

}

async function sendBookingData(bookingData) {
    const response = await fetch(baseURL + "/booking", {
        method: "POST",
        body: bookingData
    });

    let responseData = await response.json();
    
    alert(responseData.message)
}

async function displayCurrentBookings() {
    let now = new Date(Date.now());
    let request = {
        deskid: idDropdown.value,   
        // toISOString() returns date in the YYYY-MM-DDTHH:mm:ss.sssZ format -> slice of last 5 chars for correct format
        start: new Date(now.setDate(now.getDate() - 1)).toISOString().slice(0, -5), // Default start value: now minus one day (to make sure recent bookings get displayed)
        end: new Date(now.setDate(now.getDate() + 100)).toISOString().slice(0, -5), // Default end value: one week from now
        studid: studId.value
    }

    if (!request.studid) {
        alert("Please enter your student ID");
        return;
    }

    const response = await fetch(baseURL + "/bookings?" + new URLSearchParams(request), {
        method: "GET",
    });

    currentBookings = await response.json();

    let tableData = [];

    for (let booking of currentBookings) {
        tableData.push({
            id: booking.id,
            // Remove time zone & seconds and replace the "T" with a space to make the date format prettier
            start: booking.start.slice(0, -8).replace("T", " "),
            end: booking.end.slice(0, -8).replace("T", " "),
            user: booking.user,
            email: booking.email
        });
    }

    // ToDo: Correctly append checkbox to table
    // for (let i in tableData) {
    //     let checkbox = document.createElement("input");
    //     checkbox.type = "checkbox";
    //     checkbox.value = i;
    //     checkbox.id = `checkbox-${i}`
    //     tableData[i].checkbox = checkbox;
    // }

    generateTable(tableData, ["Reservation ID", "Start", "End", "User", "Email"]);

    let title = document.createElement("h2");
    title.textContent = `Bookings between ${request.start.replace("T", " ")} and ${request.end.replace("T", " ")}`
    desksTable.prepend(title)
}

async function validateInputs() {
    await updateDesksData();
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
    let responseData = await response.json();
    desksData = responseData.sort((a, b) => {
        return a.id - b.id;
    });
}

function clearTable() {
    while (desksTable.firstChild) {
        desksTable.removeChild(desksTable.firstChild);
    }
}

async function generateTable(data, headings) {
    clearTable();
    let table = document.createElement("table");
    table.appendChild(generateTableHead(headings));

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

function generateTableHead(headings) {
    let tableRow = document.createElement("tr");

    for (const property of headings) {
        let th = document.createElement("th");
        th.innerHTML = property;
        tableRow.appendChild(th);
    };

    return tableRow;
}

async function updateConversionRates() {
    const response = await fetch(conversionRateURL);
    const currentRates = await response.json();
    conversionRates = currentRates;
}

buttons.displayAllDesks.addEventListener("click", displayAllDesks);
buttons.submitBooking.addEventListener("click", submitBooking);
buttons.newBooking.addEventListener("click", createBooking);
buttons.timeslots.addEventListener("click", displayCurrentBookings);

displayAllDesks();
