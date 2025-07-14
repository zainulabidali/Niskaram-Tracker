import { database } from './firebase.js';
import { ref, set, get } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

const maleStudents = ['Ahmed', 'Bilal', 'Faisal', 'Imran', 'Yusuf', 'Zayd', 'Nashid', 'Haneef', 'Salih', 'Jabir'];
const femaleStudents = ['Amina', 'Fatima', 'Huda', 'Nadia', 'Sumayya', 'Leena', 'Maryam', 'Salma', 'Afra', 'Lubna', 'Rania', 'Shaima'];

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

// Top 10 Ranking
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
    sorted.forEach(([name, score]) => {
      const li = document.createElement('li');
      li.textContent = `${name} - ${score} മാർക്ക്`;
      rankList.appendChild(li);
    });
  });
}

updateRanking();
function loadFullHistory() {
  const historyBody = document.querySelector('#history-table tbody');
  historyBody.innerHTML = '';

  const allStudents = [...maleStudents.map(n => ({ name: n, gender: 'male' })), ...femaleStudents.map(n => ({ name: n, gender: 'female' }))];
  const totalScores = {}; // name => totalScore

  const rootRef = ref(database, `prayers`);
  get(rootRef).then(snapshot => {
    if (!snapshot.exists()) return;

    const data = snapshot.val();

    // First, compute total scores
    for (const date in data) {
      for (const name in data[date]) {
        const entry = data[date][name];
        if (!totalScores[name]) totalScores[name] = 0;
        totalScores[name] += entry.score || 0;
      }
    }

    // Combine history rows
    const historyRows = [];

    for (const date in data) {
      for (const name in data[date]) {
        const entry = data[date][name];
        const row = {
          name,
          date,
          fajr: entry.fajr ? '✅' : '❌',
          dhuhr: entry.dhuhr ? '✅' : '❌',
          asr: entry.asr ? '✅' : '❌',
          maghrib: entry.maghrib ? '✅' : '❌',
          isha: entry.isha ? '✅' : '❌',
          score: entry.score || 0,
          total: totalScores[name] || 0,
          gender: entry.gender || ''
        };
        historyRows.push(row);
      }
    }

    // Sort: male first, then female, then by total score desc
    historyRows.sort((a, b) => {
      if (a.gender !== b.gender) {
        return a.gender === 'male' ? -1 : 1;
      }
      return b.total - a.total;
    });

    // Build rows
    historyRows.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.name}</td>
        <td>${item.date}</td>
        <td>${item.fajr}</td>
        <td>${item.dhuhr}</td>
        <td>${item.asr}</td>
        <td>${item.maghrib}</td>
        <td>${item.isha}</td>
        <td>${item.score}</td>
        <td><strong>${item.total}</strong></td>
      `;
      historyBody.appendChild(tr);
    });
  });
}
window.addEventListener('DOMContentLoaded', () => {
  updateRanking();
  loadFullHistory();
});
