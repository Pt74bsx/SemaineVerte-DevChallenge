// async function loadGrades() {
//     const res = await fetch('/grades');
//     const data = await res.json();

//     const table = document.getElementById('table');
//     table.innerHTML = '';

//     const separated = Object.groupBy(data, ({ subject }) => subject);

//     Object.entries(separated).forEach(([subjectName, grades]) => {
//         const moyenne = grades.reduce((sum, grade) => sum + Number(grade.score), 0) / grades.length;
//         // grades.reduce((sum, grade) => sum + Number(grade.score), 0) / grades.length;

//         let html = `
//             <table>
//                 <thead>
//                     <tr>
//                         <th colspan="2">Module</th>
//                         <th>Note</th>
//                         <th colspan="2">Action</th>
//                     </tr>
//                 </thead>

//                 <tbody>
//         `;

//         grades.forEach(g => {
//             html += `
//                 <tr>
//                     <td colspan="2">${g.subject}</td>
//                     <td>${g.score}</td>
//                     <td colspan="2">
//                         <button onclick="deleteGrade(${g.id})">X</button>
//                     </td>
//                 </tr>
//             `;
//         });

//         html += `
//             </tbody>
//                 <tfoot>
//                     <tr class="moyennes-header">
//                         <th>
//                             <span class="moyennes-label">Moyennes</span>
//                             Semestre 1
//                         </th>
                        
//                         <th>
//                             <span class="moyennes-label">Moyennes</span>
//                             Semestre 2
//                         </th>

//                         <th>
//                             <span class="moyennes-label">Moyennes</span>
//                             Semestre 3
//                         </th>

//                         <th>
//                             <span class="moyennes-label">Moyennes</span>
//                             Semestre 4
//                         </th>

//                         <th>
//                             <span class="moyennes-label">Moyennes</span>
//                             Annuelle
//                         </th>
//                     </tr>

//                     <tr class="moyennes-values">
//                         <td>${moyenne}</td>
//                         <td>${moyenne}</td>
//                         <td>${moyenne}</td>
//                         <td>${moyenne}</td>
//                         <td>${moyenne}</td>
//                     </tr>
//                 </tfoot>
//             </table>
//         `;
        
//         table.innerHTML += html;
//     });
// }

async function loadGrades() {
    const res = await fetch('/grades');
    const data = await res.json();

    const table = document.getElementById('table');
    table.innerHTML = '';

    const separated = Object.groupBy(data, ({ subject }) => subject);

    const moduleAverages = [];

    Object.entries(separated).forEach(([subjectName, grades]) => {

        const moyenne = grades.reduce((sum, grade) => sum + Number(grade.score), 0) / grades.length;
        const trimestre = Number(grades[0].trimestre);

        moduleAverages.push({
            subject: subjectName,
            moyenne: moyenne,
            trimestre: trimestre
        });

        let html = `
            <table>
                <thead>
                    <tr>
                        <th colspan="2">Module (S${trimestre})</th>
                        <th>Note</th>
                        <th colspan="2">Action</th>
                    </tr>
                </thead>

                <tbody>
        `;

        grades.forEach(g => {
            html += `
                <tr>
                    <td colspan="2">${g.subject}</td>
                    <td>${g.score}</td>
                    <td colspan="2">
                        <button onclick="deleteGrade(${g.id})">X</button>
                    </td>
                </tr>
            `;
        });

        html += `
                </tbody>

                <tfoot>
                    <tr class="module-moyenne">
                        <td colspan="5">
                            <span class="moyennes-label">
                                Moyenne du module
                            </span>
                            ${moyenne.toFixed(2)}
                        </td>
                    </tr>
                </tfoot>
            </table>
        `;

        table.innerHTML += html;
    });

    const semestres = [];

    for (let i = 1; i <= 4; i++) {

        const modulesDuSemestre = moduleAverages.filter(
            module => module.trimestre === i
        );

        let moyenne = 0;

        if (modulesDuSemestre.length > 0) {
            moyenne =
                modulesDuSemestre.reduce(
                    (sum, module) => sum + module.moyenne,
                    0
                ) / modulesDuSemestre.length;
        }

        semestres.push(moyenne);
    }

    let moyenneAnnuelle = 0;

    if (moduleAverages.length > 0) {
        moyenneAnnuelle =
            moduleAverages.reduce(
                (sum, module) => sum + module.moyenne,
                0
            ) / moduleAverages.length;
    }

    let moyenneFinaleHTML = `
        <table class="moyennes-finales">
            <thead>
                <tr class="moyennes-header">
                    <th>
                        <span class="moyennes-label">Moyenne</span>
                        Semestre 1
                    </th>

                    <th>
                        <span class="moyennes-label">Moyenne</span>
                        Semestre 2
                    </th>

                    <th>
                        <span class="moyennes-label">Moyenne</span>
                        Semestre 3
                    </th>

                    <th>
                        <span class="moyennes-label">Moyenne</span>
                        Semestre 4
                    </th>

                    <th>
                        <span class="moyennes-label">Moyenne</span>
                        Annuelle
                    </th>
                </tr>
            </thead>

            <tbody>
                <tr class="moyennes-values">
                    <td>${semestres[0].toFixed(2)}</td>
                    <td>${semestres[1].toFixed(2)}</td>
                    <td>${semestres[2].toFixed(2)}</td>
                    <td>${semestres[3].toFixed(2)}</td>
                    <td>${moyenneAnnuelle.toFixed(2)}</td>
                </tr>
            </tbody>
        </table>
    `;

    table.innerHTML += moyenneFinaleHTML;
}

async function loadSubjects() {
    const res = await fetch('/subjects');
    const data = await res.json();

    const select = document.getElementById('subjectSelect');
    select.innerHTML = '';

    data.forEach(s => {
        select.innerHTML += `
            <option value="${s.id}">
                ${s.name}
            </option>
        `;
    });
}

async function addGrade() {
    const subject_id = document.getElementById('subjectSelect').value;
    const score = document.getElementById('score').value;

    await fetch('/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject_id, score })
    });

    loadGrades();
}

async function addSubject() {
    const name = document.getElementById('newSubject').value;
    const trimestre = document.getElementById('trimestre-select').value;

    if (!name || !trimestre) {
        alert("Veuillez entrer un nom de module et choisir un trimestre.");
        return;
    }

    await fetch('/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, trimestre })
    });

    loadSubjects();

    document.getElementById('newSubject').value = '';
    document.getElementById('trimestre-select').value = '';
}

async function deleteGrade(id) {
    await fetch(`/grades/${id}`, { method: 'DELETE' });
    loadGrades();
}

loadSubjects();
loadGrades();