
const panelAzimuth = document.querySelector("#azimuth");
const panelZenith = document.querySelector("#zenith")


const batteryCapacity = document.querySelector("#batteryCapacity");
const batteryVoltage = document.querySelector("#batteryVoltage");
const dischargeDepth = document.querySelector("#dischargeDepth");


const loadSummer = document.querySelector("#loadSummer");
const loadWinter = document.querySelector("#loadWinter");

const panelLatitute = document.querySelector("#latitute");
const panelLongitude = document.querySelector("#longitude");

const resultWinter = document.querySelector("#result-winter");
const resultSummer = document.querySelector("#result-summer");
const resultArea = document.querySelector("#result-area");


const solarPanel = document.getElementById("solarPanels");
const dialog = document.getElementById("dialog");

const errorText = document.getElementById("errorText");

const jsbutton = document.getElementById("jsbutton");

const dialogCapacity = document.getElementById("dialog-capacity");

const panelQty = document.querySelector("#panelQty");

const ctx = document.getElementById('myChart').getContext('2d');

const address = document.querySelector("#address");
const resultCity = document.querySelector("#results")



// panelAzimuth.addEventListener("input", (e) => {
//     // debugger
//     panelAzimuth.value = e.target.value;
// });

const solarPanelSettings = {
    "mono_60": { capacity: 60, area: 0.5 },
    "mono_200": { capacity: 200, area: 1.7 },
    "poly_60": { capacity: 60, area: 0.7 },
    "poly_200": { capacity: 200, area: 2.1 },
    "poly_300": { capacity: 300, area: 2.8 },
};

let systemCapacity = solarPanelSettings[solarPanel.value].capacity;
let systemArea = solarPanelSettings[solarPanel.value].area;

solarPanel.addEventListener("change", (e) => {

    
    if (!solarPanelSettings[e.target.value]) {
        // todo
        dialog.showModal();
    } else {
        systemCapacity = solarPanelSettings[e.target.value].capacity;
    }

    solarPanel.value = e.target.value;
});



jsbutton.addEventListener('click', () => {
    systemCapacity = Number(dialogCapacity.value);
    if (!systemCapacity) {return;}
    dialog.close();
});

// console.log(pane)

// const totalCapacity = systemCapacity * panelQty.value;

// console.log(systemArea);


ymaps.ready(init);
var myMap;

function init () {
    myMap = new ymaps.Map("map", {
        center: [43.2363, 76.8929], // Алматы
        zoom: 11
    }, {
        balloonMaxWidth: 200,
        searchControlProvider: 'yandex#search'
    });

    // Обработка события, возникающего при щелчке
    // левой кнопкой мыши в любой точке карты.
    // При возникновении такого события откроем балун.
    myMap.events.add('click', function (e) {
        if (!myMap.balloon.isOpen()) {
            var coords = e.get('coords');
            myMap.balloon.open(coords, {
                contentHeader:'Отметка',
                contentBody:
                    '<p>Координаты отметки: ' + [
                    coords[0].toPrecision(6),
                    coords[1].toPrecision(6)
                    ].join(', ') + '</p>',
                contentFooter:'<sup>Щелкните еще раз</sup>'
            });
        }
        else {
            myMap.balloon.close();
        }
    });

    // Обработка события, возникающего при щелчке
    // правой кнопки мыши в любой точке карты.
    // При возникновении такого события покажем всплывающую подсказку
    // в точке щелчка.
    myMap.events.add('contextmenu', function (e) {
        myMap.hint.open(e.get('coords'), 'Кто-то щелкнул правой кнопкой');
    });
    
    // Скрываем хинт при открытии балуна.
    myMap.events.add('balloonopen', function (e) {
        myMap.hint.close();
    });
}


function calculateArea({
    panelQty,
    systemArea
}) {
    const totalArea = panelQty.value * systemArea;
    // console.log(panelQty);
    resultArea.innerText = isNaN(totalArea) ? 0 : totalArea;

}


function calculate({
    loadSummer,
    loadWinter,
    batteryCapacity,
    batteryVoltage,
    dischargeDepth
}) {
    const energyBattery = batteryCapacity.value * batteryVoltage.value * ((100 - dischargeDepth.value) / 100);
    const summerDays = Math.round(energyBattery * 24 / (1000 * loadSummer.value));
    const winterDays = Math.round(energyBattery * 24 / (1000 * loadWinter.value));
    // debugger
    // console.log(energyBattery)
    resultSummer.innerText = isNaN(summerDays) ? 0 : summerDays;
    resultWinter.innerText = isNaN(winterDays) ? 0 : winterDays;
}

dischargeDepth.addEventListener("input", ({ target }) => {
    calculate({loadSummer, loadWinter, batteryCapacity, batteryVoltage, dischargeDepth: target });
});

loadSummer.addEventListener("input", ({ target }) => {
    calculate({loadSummer: target, loadWinter, batteryCapacity, batteryVoltage, dischargeDepth });
});

loadWinter.addEventListener("input", ({ target }) => {
    calculate({loadSummer, loadWinter: target, batteryCapacity, batteryVoltage, dischargeDepth });
});

batteryCapacity.addEventListener("input", ({ target }) => {
    calculate({loadSummer, loadWinter, batteryCapacity: target, batteryVoltage, dischargeDepth });
});

batteryVoltage.addEventListener("input", ({ target }) => {
    calculate({loadSummer, loadWinter, batteryCapacity, batteryVoltage: target, dischargeDepth });
});

panelQty.addEventListener("input", ({ target }) => {
    calculateArea({systemArea, panelQty})
})

function fetchSolarData() {
    // debugger
    // Get all necessary data
    if (!panelAzimuth.value || !panelZenith.value || !systemCapacity || !systemArea) {
        return;
    }
    const totalCapacity = systemCapacity * panelQty.value / 1000;  // in kW

    // console.log(totalCapacity);
    

    errorText.innerText = "";

    // fetch(`https://developer.nrel.gov/api/pvwatts/v6.json?api_key=2iPuhSuZ0TZ0FM6xJXDqdLdM0JnfWWGZCn6hi0el&lat=40&lon=-105&system_capacity=${totalCapacity}&azimuth=${panelAzimuth.value}&tilt=${panelZenith.value}&array_type=1&module_type=1&losses=10`)
    fetch(`https://developer.nrel.gov/api/pvwatts/v8.json?api_key=2iPuhSuZ0TZ0FM6xJXDqdLdM0JnfWWGZCn6hi0el&azimuth=180&system_capacity=4&losses=14&array_type=1&module_type=0&gcr=0.4&dc_ac_ratio=1.2&inv_eff=96.0&radius=0&dataset=nsrdb&tilt=10&address=almaty&albedo=0.3&bifaciality=0.7`)
    .then(response => {
        // console.log(response)
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // debugger
        // document.getElementById("totalEnergy").innerText = data;
        // console.log(data.outputs.ac_monthly)
        const ac_monthly = data.outputs.ac_monthly
        const ac_daily_avg = ac_monthly.map(value => Number.parseFloat(value / 30).toFixed(3));
        plotLine(ac_daily_avg);
        // document.getElementById("averageEnergyTable").innerText = "Среднемесячная выработка электроэнергии, кВт*ч/сутки";
        plotTable(ac_daily_avg);
    })
    .catch(error => {
        console.log('There was a problem with the fetch operation:', error);
    });

}

let myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
        datasets: [{
            label: 'Выработка солнечной батареи',
            data: [],
            fill: false,
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
        }],
    },
    options: {
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'количество энергии, кВт*ч/сутки'
                }

            }
        }
    }
});

const monthTable = document.getElementById('tableMonth');
const energyDataRow = document.getElementById('tableEnergy');
const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];


function plotLine(ac_daily_avg) {
    myChart.data.datasets[0].data = ac_daily_avg;
    myChart.update()
}

function plotTable(energyData) {         
    
    monthTable.innerHTML = "";
    energyDataRow.innerHTML = "";

    for (let i=0; i<months.length; i++) {
        const monthCell = document.createElement('td');
        monthCell.textContent = months[i];
        monthTable.appendChild(monthCell);

        const energyDataCell = document.createElement('td');
        energyDataCell.textContent = energyData[i];
        energyDataRow.appendChild(energyDataCell);

    }

}
