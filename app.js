const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const JSON_DIR = path.join(__dirname, 'jsons');
const POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Function to generate the leaderboard
function generateLeaderboard(callback) {
  let leaderboard = {};

  fs.readdir(JSON_DIR, (err, files) => {
    if (err) return callback(err);

    files.forEach(file => {
      let rawData = fs.readFileSync(path.join(JSON_DIR, file));
      let raceData = JSON.parse(rawData);

      raceData.racers.forEach(racer => {
        if (!leaderboard[racer.name]) {
          leaderboard[racer.name] = {
            name: racer.name,
            score: 0,
            carNumber: racer.carNumber,
            penalties: racer.penalties || 0,
            position: racer.position 
          };
        } else {
          leaderboard[racer.name].penalties += racer.penalties || 0;
        }

        if (racer.position <= 10) {
          leaderboard[racer.name].score += POINTS[racer.position - 1];
        }
      });
    });

    const sortedLeaderboard = Object.values(leaderboard).sort((a, b) => b.score - a.score);

    callback(null, sortedLeaderboard);
  });
}

app.get('/leaderboard', (req, res) => {
  generateLeaderboard((err, sortedLeaderboard) => {
    if (err) return res.status(500).send('Error generating leaderboard');

    res.json(sortedLeaderboard);
  });
});

app.get('/', (req, res) => {
  generateLeaderboard((err, sortedLeaderboard) => {
    if (err) return res.status(500).send('Error generating leaderboard');

    res.render('index', { leaderboard: sortedLeaderboard });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
