import "./styles.css";
import 'regenerator-runtime/runtime'

import Reveal from "reveal.js";

Reveal.initialize({
  hash: true,
  controlsTutorial: true,
  controlsLayout: "edges"
});

const artistComponent = (name, url, genresList, i) => {
  const artistTemplate = `
  <div>
    <h5>${i + 1} </h5>

    <h2>${name}</h2>
    <img class="r-stretch" src="${url}"/>
    <p>${genresList}</p>
  </div>	
`;
  return artistTemplate;
};

const tracksComponent = (name, url, artists, i) => {
  const tpl = `
  <section>
    <h5>${i + 1} </h5>

    <h2>${name}</h2>
    <img class="r-stretch" src="${url}"/>
    <p>${artists}</p>
  </section>	
`;
  return tpl;
};

const welcomeComponent = (name) => {
  return `
    Welcome ${name}
    <h2>💽</h2>
`;
};

// INIT spotify
const baseStotifyUrl = "https://api.spotify.com";
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get("access_token");

const getAllInfo = async () => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`
    };

    const user = await fetch(`${baseStotifyUrl}/v1/me`, {
      headers
    }).then((data) => data.json());

    console.log(user);

    const welcome = document.querySelector(`.welcome`);

    welcome.innerHTML = welcomeComponent(user.display_name);

    const artistsResponse = await fetch(`${baseStotifyUrl}/v1/me/top/artists`, {
      headers
    }).then((data) => data.json());

    const { items } = artistsResponse;

    const [a, b, c, ...d] = items;

    const top3 = [a, b, c];
    top3.forEach((element, i) => {
      // console.log(element)
      const url = element.images[1].url;
      const { name, genres } = element;

      const genresList = genres.join(", ");
      const tpl = artistComponent(name, url, genresList, i);

      const el = document.querySelector(`.artist-${i}`);

      el.innerHTML = tpl;
    });

    const tracksResponse = await fetch(`${baseStotifyUrl}/v1/me/top/tracks`, {
      headers
    }).then((data) => data.json());

    const { items: tracks } = tracksResponse;

    console.log(tracks);

    tracks.forEach((track, i) => {
      const url = track.album.images[0].url;

      const artists = track.artists.map(({ name }) => name).join(", ");

      const trackList = document.querySelector(`.tracks`);

      trackList.innerHTML += tracksComponent(track.name, url, artists, i);
    });

    const ids = tracks.map(({ id }) => id);

    const featUrl = new URL(`${baseStotifyUrl}/v1/audio-features`);

    const params = { ids: ids.join(",") };
    Object.keys(params).forEach((key) =>
      featUrl.searchParams.append(key, params[key])
    );

    const { audio_features } = await fetch(featUrl, {
      headers
    }).then((data) => data.json());

    console.log(audio_features);

    const total = audio_features.reduce(
      (prev, { danceability, energy, valence }) => {
        prev = {
          danceability: prev.danceability + danceability,
          energy: prev.energy + energy,
          valence: prev.valence + valence
        };
        return prev;
      },
      { danceability: 0, energy: 0, valence: 0 }
    );

    console.log("//////");
    console.log(total);

    const avg = {
      danceability: total.danceability / 20,
      energy: total.energy / 20,
      valence: total.valence / 20
    };

    const calcH = (avg) => avg * 200;

    const danceDiv = `
    <div data-id="box1" data-auto-animate-delay="0"
        style="background: cyan; width: 250px; height: ${calcH(
          avg.danceability
        )}px; margin: 10px" data-auto-animate-target="">
      </div>
    `;

    const energyDiv = `
    <div data-id="box2" data-auto-animate-delay="0"
        style="background: magenta; width: 250px; height: ${calcH(
          avg.energy
        )}px; margin: 10px" data-auto-animate-target="">
      </div>
    `;
    const valenceDiv = `
    <div data-id="box3" data-auto-animate-delay="0"
        style="background: yellow; width: 250px; height: ${calcH(
          avg.valence
        )}px; margin: 10px" data-auto-animate-target="">
      </div>
    `;

    console.log(avg);

    let boxesEl = document.querySelector(`.boxes-append`);

    boxesEl.innerHTML += danceDiv;
    boxesEl.innerHTML += energyDiv;
    boxesEl.innerHTML += valenceDiv;

    console.log(boxesEl);

    // Reveal.initialize({
    // 	hash: true,
    // 	controlsTutorial: true,
    // 	controlsLayout: 'edges',

    // 	plugins: [RevealMarkdown, RevealHighlight, RevealNotes]
    // });

    Reveal.sync();

    setTimeout(() => {
      const indice = Reveal.getIndices();

      if (indice.h === 0) {
        Reveal.right();
      }
    }, 1000);
  } catch (e) {
    console.error(e);

    const login = document.querySelector(".login");

    console.log(process)
    const button = `
      <a href="recap.antogin.dev/api/auth/login">login</a>
    `;

    login.innerHTML += button;
  }
};

getAllInfo();
