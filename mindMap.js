const fs = require('fs')

function readFileSync(path) {
  try {
    return fs.readFileSync(path, 'utf8')
  } catch (err) {
    console.error("Error reading file:", err)
    return null
  }
}

function writeFileSync(path, data) {
  try {
    fs.writeFileSync(path, data, 'utf8')
  } catch (err) {
    console.error("Error writing file:", err)
  }
}

const natureTypes = JSON.parse(readFileSync('nature_type.json'))
const natures = JSON.parse(readFileSync('nature.json'))
const subNatures = JSON.parse(readFileSync('sub_nature.json'))
const docs = JSON.parse(readFileSync('doc_type.json'))
const iofs = JSON.parse(readFileSync('iof.json'))


const natureTypesCache = []
for (const nt of natureTypes) {
  natureTypesCache.push({
    content: `${nt.name} (${nt.clientType})`,
    natureCodes: nt.natureCodes
  })
}

const iofsCache = {}
for (const iof of iofs) {
  iofsCache[iof.code] = parseFloat(iof.iof) || 0.0
}

const naturesCache = {}
for (const n of natures) {
  naturesCache[n.code] = {
    content: `code: ${n.code}, name: ${n.name}; iof: ${iofsCache[n.code]}`,
    subNatureCodes: n.subNatureCodes || [],
    docCodes: n.rules?.docTypes || []
  }
}

const subNaturesCache = {}
for (const sn of subNatures) {
  subNaturesCache[sn.code] = {
    content: `code: ${sn.code} name: ${sn.name}; `,
    docCodes: sn.rules.docTypes || []
  }
}

const docsCache = {}
for (const d of docs) {
  docsCache[d.code] = {
    content: `code: ${d.code} name: ${d.name}; `
  }
}

const db = []
for (const natureType of natureTypesCache) {
  const natureTypeDb = {}

  natureTypeDb.content = natureType.content
  natureTypeDb.natures = []

  for (const natureCode of natureType.natureCodes) {
    const nature = naturesCache[natureCode]
    const natureDb = {}

    natureDb.content = nature.content

    for (const subNatureCode of nature.subNatureCodes) {
      const subNature = subNaturesCache[subNatureCode]
      const subNatureDb = {}

      subNatureDb.content = subNature.content
      subNatureDb.docs = []

      for (const docCode of subNature.docCodes) {
        const doc = docsCache[docCode]
        if (doc == null) continue
        subNatureDb.docs.push(doc)
      }

      natureDb.subNatures = natureDb.subNatures || []
      natureDb.subNatures.push(subNatureDb)
    }

    for (const docCode of nature.docCodes) {
      const doc = docsCache[docCode]
      if (doc == null) continue
      natureDb.docs = natureDb.docs || []
      natureDb.docs.push(doc)
    }

    natureTypeDb.natures.push(natureDb)
  }

  db.push(natureTypeDb)
}

let result = 'Tipos de naturezas\n'
for (const natureType of db) {
  result += `${'\t'.repeat(1)}${natureType.content}\n`
  for (const nature of natureType.natures) {
    result += `${'\t'.repeat(2)}${nature.content}\n`

    if (nature.subNatures != null) {
      result += `${'\t'.repeat(3)}Sub-naturezas\n`
      for (const subNature of nature.subNatures) {
        result += `${'\t'.repeat(4)}${subNature.content}\n`

        for (const doc of subNature.docs) {
          result += `${'\t'.repeat(5)}${doc.content}\n`
        }
      }
    }

    if (nature.docs != null) {
      result += `${'\t'.repeat(3)}Documentos\n`
      for (const doc of nature.docs) {
        result += `${'\t'.repeat(4)}${doc.content}\n`
      }
    }
  }
}

// Example usage:
writeFileSync('mindMap.txt', result);
