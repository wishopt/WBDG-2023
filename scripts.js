const baseURL = "https://matthiasbaldauf.com/wbdg23";
const conversionRateURL = "https://api.exchangerate.host/latest";

const contentDiv = document.getElementById("content");
const buttons = {
    displayAllDesks: document.getElementById("btnDisplayAllDesks"),
    newBooking: document.getElementById("btnNewBooking"),
    allBookings: document.getElementById("btnMyBookings")
};

let conversionRates;

async function displayAllDesks() {
    const response = await fetch(baseURL + "/desks");
    const desksData = await response.json();

    clearContent();
    generateTable(desksData);
}

function clearContent() {
    while (contentDiv.firstChild) {
        contentDiv.removeChild(contentDiv.firstChild);
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

    contentDiv.appendChild(table);
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