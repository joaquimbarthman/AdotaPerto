import fs from "node:fs/promises";
import path from "node:path";

const assets = {
  "animals": {
    "bento": [
      35511894,
      35511913,
      6663352
    ],
    "amora": [
      2257262,
      10834660,
      18364269
    ],
    "simba": [
      17377944,
      13678433,
      4051516
    ],
    "nina": [
      12721114,
      11654136,
      11654746
    ],
    "frajola": [
      1605481,
      4076582,
      37217680
    ],
    "melissa": [
      8706371,
      16902718,
      464664
    ],
    "tobias": [
      19322045,
      6734029,
      20368539
    ],
    "cacau": [
      18188787,
      14257428,
      19296517
    ],
    "zeus": [
      12698537,
      19131363,
      16362981
    ],
    "olivia": [
      596590,
      596591,
      1082255
    ],
    "pacoca": [
      20167768,
      11030310,
      13587074
    ],
    "jade": [
      23957292,
      18540610,
      19806444
    ]
  },
  "items": {
    "racao": [
      18764141,
      34952078,
      6568949
    ],
    "caminha": [
      2248516,
      19027991,
      3362700
    ],
    "brinquedos": [
      14534149,
      16532832,
      18478445
    ],
    "coleira": [
      8030852,
      13925388,
      16697847
    ],
    "caixa": [
      21767483,
      29931479,
      21767483
    ],
    "shampoo": [
      19021958,
      19022002,
      19021958
    ],
    "potes": [
      8434670,
      27046439,
      5482828
    ],
    "manta": [
      3977645,
      35431745,
      19823545
    ],
    "areia": [
      13705497,
      13705506,
      10672058
    ],
    "petiscos": [
      13419673,
      8434637,
      8121142
    ],
    "roupinhas": [
      6379255,
      18062004,
      19321355
    ],
    "tapetes": [
      33744730,
      37256971,
      33744730
    ]
  }
};

const root = path.join(process.cwd(), "public", "seed");

function imageUrl(id) {
  // Pexels CDN, fixed photo ID. No random search.
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1200&h=900&fit=crop`;
}

async function download(url, destination) {
  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent": "Mozilla/5.0 SeedDownloader/1.0",
      "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  if (buffer.length < 10_000) {
    throw new Error(`arquivo muito pequeno (${buffer.length} bytes)`);
  }

  await fs.writeFile(destination, buffer);
}

let done = 0;
let failed = 0;

for (const [group, entries] of Object.entries(assets)) {
  for (const [name, ids] of Object.entries(entries)) {
    const dir = path.join(root, group, name);
    await fs.mkdir(dir, { recursive: true });

    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const destination = path.join(dir, `${i + 1}.jpg`);
      const url = imageUrl(id);

      try {
        console.log(`Baixando ${group}/${name}/${i + 1}.jpg...`);
        await download(url, destination);
        done++;
      } catch (error) {
        failed++;
        console.error(`ERRO em ${group}/${name}/${i + 1}: ${error.message}`);
      }
    }
  }
}

console.log(`\nFinalizado: ${done} imagens baixadas, ${failed} falhas.`);
console.log(`Pasta: ${root}`);

if (failed > 0) {
  console.log("Rode o script novamente para tentar baixar os arquivos que falharam.");
  process.exitCode = 1;
}
