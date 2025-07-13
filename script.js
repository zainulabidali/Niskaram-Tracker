import { database } from './firebase.js';
import { ref, push, set, get } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

const maleStudents = ['Ahmed', 'Bilal', 'Faisal', 'Imran', 'Yusuf', 'Zayd', 'Nashid', 'Haneef', 'Salih', 'Jabir'];
const femaleStudents = ['Amina', 'Fatima', 'Huda', 'Nadia', 'Sumayya', 'Leena', 'Maryam', 'Salma', 'Afra', 'Lubna', 'Rania', 'Shaima'];

const genderRadios = document.getElementsByName('gender');
const nameSelect = document.getElementById('name');
const form = document.getElementById('prayerForm');
const rankList = document.getElementById('rankList');

genderRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    nameSelect.innerHTML = '<option value="">-- Select Name --</option>';
    const list = radio.value === 'male' ? maleStudents : femaleStudents;
    list.forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      nameSelect.appendChild(option);
    });
  });
});

document.getElementById('date').valueAsDate = new Date();

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const className = document.getElementById('class').value;
  const gender = document.querySelector('input[name="gender"]:checked').value;
  const name = document.getElementById('name').value;
  const date = document.getElementById('date').value;

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
  push(entryRef, data).then(() => {
    alert('Prayer submitted!');
    form.reset();
    document.getElementById('date').valueAsDate = new Date();
    nameSelect.innerHTML = '<option value="">-- Select Name --</option>';
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
      let total = 0;
      for (const entryId in data[student]) {
        const entry = data[student][entryId];
        total += entry.score || 0;
      }
      scores[student] = total;
    }

    const sorted = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    rankList.innerHTML = '';
    sorted.forEach(([name, score]) => {
      const li = document.createElement('li');
      li.textContent = `${name} - ${score} marks`;
      rankList.appendChild(li);
    });
  });
}

updateRanking();
