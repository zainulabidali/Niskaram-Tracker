import { database } from './firebase.js';
import { ref, set, get } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

const maleStudents = ['Ibrahim Bathisha ', 'Muhammed SM', 'Abdulla MA', 'Muhammed Javad MA', 'Nasrul Azman', 'Muhammed Musthafa', 'Kubaib', 'Muhammed Swalih', 'Abdulla Mirshad', 'Muhammed Saeed', 'Zakwan', 'Adham Abdulla'];
const femaleStudents = ['Ayshath Muneeba', 'Maryam CA', 'Maryam Zahra', 'Maryam Ahmed Naseer', 'Fathimath Shifa', 'Rifa Fathima', 'Ayshath Shaza', 'Shama Fathima', 'Fathimath Shanza Mahzin', 'Maryam Mehk',];

const genderRadios = document.getElementsByName('gender');
const nameSelect = document.getElementById('name');
const form = document.getElementById('prayerForm');
const rankList = document.getElementById('rankList');
const dateInput = document.getElementById('date');

dateInput.valueAsDate = new Date();

// Gender change => name update
genderRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    nameSelect.innerHTML = '<option value="">-- പേരെ തിരഞ്ഞെടുക്കുക --</option>';
    const list = radio.value === 'male' ? maleStudents : femaleStudents;
    list.forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      nameSelect.appendChild(option);
    });
  });
});

// Load existing data when name or date changes
nameSelect.addEventListener('change', loadExistingData);
dateInput.addEventListener('change', loadExistingData);

function loadExistingData() {
  const name = nameSelect.value;
  const date = dateInput.value;
  if (!name || !date) return;

  const entryRef = ref(database, `prayers/${date}/${name}`);
  get(entryRef).then(snapshot => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      document.getElementById('fajr').checked = !!data.fajr;
      document.getElementById('dhuhr').checked = !!data.dhuhr;
      document.getElementById('asr').checked = !!data.asr;
      document.getElementById('maghrib').checked = !!data.maghrib;
      document.getElementById('isha').checked = !!data.isha;
    } else {
      ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].forEach(id => {
        document.getElementById(id).checked = false;
      });
    }
  });
}

// Submit form
form.addEventListener('submit', function (e) {
  e.preventDefault();

  const className = document.getElementById('class').value;
  const gender = document.querySelector('input[name="gender"]:checked').value;
  const name = nameSelect.value;
  const date = dateInput.value;

  const fajr = document.getElementById('fajr').checked;
  const dhuhr = document.getElementById('dhuhr').checked;
  const asr = document.getElementById('asr').checked;
  const maghrib = document.getElementById('maghrib').checked;
  const isha = document.getElementById('isha').checked;

  const score = (fajr ? 1 : 0) + (dhuhr ? 1 : 0) + (asr ? 1 : 0) + (maghrib ? 1 : 0) + (isha ? 1 : 0);

  const data = {
    class: className,
    gender,
    fajr,
    dhuhr,
    asr,
    maghrib,
    isha,
    score
  };

  const entryRef = ref(database, `prayers/${date}/${name}`);
  set(entryRef, data).then(() => {
    alert('പ്രാർത്ഥന വിജയകരമായി അപ്‌ഡേറ്റ് ചെയ്തു!');
    updateRanking();
  });
});




function updateRanking() {
  const today = new Date().toISOString().slice(0, 10);
  const dayRef = ref(database, `prayers/${today}`);

  get(dayRef).then(snapshot => {
    if (!snapshot.exists()) return;

    const data = snapshot.val();
    const scores = {};

    for (const student in data) {
      const entry = data[student];
      scores[student] = entry.score || 0;
    }

    const sorted = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    rankList.innerHTML = '';

    sorted.forEach(([name, score], index) => {
  const li = document.createElement('li');
  rankList.appendChild(li); // Add to the list first

  let icon = '';
  if (index === 0) icon = '🏆';
  else if (index === 1) icon = '🥈';
  else if (index === 2) icon = '🥉';
  else icon = '🔹';

  const fullText = ` ${icon} ${name} - ${score} മാർക്ക്`;
  let i = 0;

  function typeChar() {
    if (i <= fullText.length) {
      li.textContent = fullText.slice(0, i);
      i++;
      setTimeout(typeChar, 30); // Typing speed per character
    }
  }

  setTimeout(typeChar, index * 200); // Stagger each list item
});

  });
}

updateRanking();

// topper this week and last week
function showLastWeekTop() {
  const today = new Date();
  const last7Dates = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    last7Dates.push(d.toISOString().slice(0, 10));
  }

  getTopPerformers(last7Dates, 5, 'weekRankList');
}

function showLastMonthTop() {
  const today = new Date();
  const last30Dates = [];

  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    last30Dates.push(d.toISOString().slice(0, 10));
  }

  getTopPerformers(last30Dates, 7, 'monthRankList');
}

function getTopPerformers(dates, topN, elementId) {
  const rootRef = ref(database, 'prayers');

  get(rootRef).then(snapshot => {
    if (!snapshot.exists()) return;

    const data = snapshot.val();
    const scores = {};

    dates.forEach(date => {
      if (data[date]) {
        for (const name in data[date]) {
          if (!scores[name]) scores[name] = 0;
          scores[name] += data[date][name].score || 0;
        }
      }
    });

    const sorted = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN);

    const rankList = document.getElementById(elementId);
    rankList.innerHTML = '';
sorted.forEach(([name, score], index) => {
  const li = document.createElement('li');
  rankList.appendChild(li);

  let icon = '';
  if (index === 0) icon = '🏆';
  else if (index === 1) icon = '🥈';
  else if (index === 2) icon = '🥉';
  else icon = '🔹';

  const fullText = `${icon} ${name} - ${score} മാർക്ക്`;

  let i = 0;
  function typeChar() {
    if (i <= fullText.length) {
      li.textContent = fullText.slice(0, i);
      i++;
      setTimeout(typeChar, 20); // Adjust speed here (ms per char)
    }
  }

  setTimeout(typeChar, index * 500); // Stagger start for each li
});

  });
}

// Auto run on page load
showLastWeekTop();
showLastMonthTop();

























// function loadFullHistory() {
//   const historyBody = document.querySelector('#history-table tbody');
//   historyBody.innerHTML = '';

//   const rootRef = ref(database, `prayers`);
//   get(rootRef).then(snapshot => {
//     if (!snapshot.exists()) return;

//     const data = snapshot.val();
//     const totalScores = {}; // name => totalScore
//     const historyRows = [];

//     // Step 1: Calculate total scores
//     for (const date in data) {
//       for (const name in data[date]) {
//         const entry = data[date][name];
//         if (!totalScores[name]) totalScores[name] = 0;
//         totalScores[name] += entry.score || 0;
//       }
//     }

//     // Step 2: Create per-day entries
//     for (const date in data) {
//       for (const name in data[date]) {
//         const entry = data[date][name];
//         historyRows.push({
//           name,
//           date,
//           fajr: entry.fajr ? '✅' : '❌',
//           dhuhr: entry.dhuhr ? '✅' : '❌',
//           asr: entry.asr ? '✅' : '❌',
//           maghrib: entry.maghrib ? '✅' : '❌',
//           isha: entry.isha ? '✅' : '❌',
//           score: entry.score || 0,
//           total: totalScores[name] || 0,
//           gender: entry.gender || ''
//         });
//       }
//     }

//     // Step 3: Sorting (date descending → male first → name)
//     historyRows.sort((a, b) => {
//       if (a.date !== b.date) {
//         return b.date.localeCompare(a.date); // Newer date first
//       }
//       if (a.gender !== b.gender) {
//         return a.gender === 'male' ? -1 : 1; // Male first
//       }
//       return a.name.localeCompare(b.name); // Name as final tiebreaker
//     });

//     // Step 4: Render
//     historyRows.forEach(item => {
//       const tr = document.createElement('tr');
//       tr.innerHTML = `
//         <td>${item.name}</td>
//         <td>${item.date}</td>
//         <td>${item.fajr}</td>
//         <td>${item.dhuhr}</td>
//         <td>${item.asr}</td>
//         <td>${item.maghrib}</td>
//         <td>${item.isha}</td>
//         <td>${item.score}</td>
//         <td><strong>${item.total}</strong></td>
//       `;
//       historyBody.appendChild(tr);
//     });
//   });
// }

window.addEventListener('DOMContentLoaded', () => {
  updateRanking();
  loadFullHistory();
});
