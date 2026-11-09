import type { Color, Figure, FigureItem, Rng } from '@krok/core'
import { choiceAnswer, exercise, figure, topicFactory } from '../../lib'

const topic = topicFactory('geometry', 10)

// ───────────── куб: координати, прямі, площини ─────────────

type V3 = [number, number, number]
const P3: Record<string, V3> = {
  A: [0, 0, 0],
  B: [1, 0, 0],
  C: [1, 1, 0],
  D: [0, 1, 0],
  'A₁': [0, 0, 1],
  'B₁': [1, 0, 1],
  'C₁': [1, 1, 1],
  'D₁': [0, 1, 1],
}
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const isZero = (v: V3) => v[0] === 0 && v[1] === 0 && v[2] === 0

type Line = [string, string]
interface Plane {
  name: string
  verts: [string, string, string, string]
  face: boolean
}

const mkPlane = (verts: [string, string, string, string], face: boolean): Plane => ({ name: verts.join(''), verts, face })
const FACES: Plane[] = [
  mkPlane(['A', 'B', 'C', 'D'], true),
  mkPlane(['A₁', 'B₁', 'C₁', 'D₁'], true),
  mkPlane(['A', 'B', 'B₁', 'A₁'], true),
  mkPlane(['D', 'C', 'C₁', 'D₁'], true),
  mkPlane(['A', 'D', 'D₁', 'A₁'], true),
  mkPlane(['B', 'C', 'C₁', 'B₁'], true),
]
const SECTIONS: Plane[] = [
  mkPlane(['A', 'C', 'C₁', 'A₁'], false),
  mkPlane(['B', 'D', 'D₁', 'B₁'], false),
  mkPlane(['A', 'B', 'C₁', 'D₁'], false),
  mkPlane(['A₁', 'B₁', 'C', 'D'], false),
  mkPlane(['A', 'D', 'C₁', 'B₁'], false),
  mkPlane(['A₁', 'D₁', 'C', 'B'], false),
]
const PLANES: Plane[] = [...FACES, ...SECTIONS]

const normal = (p: Plane): V3 => cross(sub(P3[p.verts[1]], P3[p.verts[0]]), sub(P3[p.verts[2]], P3[p.verts[0]]))

type LP = 'in' | 'parallel' | 'intersect'
function relLP(l: Line, p: Plane): LP {
  const n = normal(p)
  const d = sub(P3[l[1]], P3[l[0]])
  if (dot(n, d) === 0) return dot(n, sub(P3[l[0]], P3[p.verts[0]])) === 0 ? 'in' : 'parallel'
  return 'intersect'
}
type PP = 'same' | 'parallel' | 'intersect'
function relPP(p: Plane, q: Plane): PP {
  const n1 = normal(p)
  const n2 = normal(q)
  if (isZero(cross(n1, n2))) return dot(n1, sub(P3[q.verts[0]], P3[p.verts[0]])) === 0 ? 'same' : 'parallel'
  return 'intersect'
}

const EDGES: Line[] = [
  ['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'],
  ['A₁', 'B₁'], ['B₁', 'C₁'], ['C₁', 'D₁'], ['D₁', 'A₁'],
  ['A', 'A₁'], ['B', 'B₁'], ['C', 'C₁'], ['D', 'D₁'],
]
const DIAGS: Line[] = [
  ['A', 'C'], ['B', 'D'], ['A₁', 'C₁'], ['B₁', 'D₁'],
  ['A', 'B₁'], ['A₁', 'B'], ['D', 'C₁'], ['D₁', 'C'],
  ['A', 'D₁'], ['A₁', 'D'], ['B', 'C₁'], ['B₁', 'C'],
]
const LINES: Line[] = [...EDGES, ...DIAGS]
const nm = (l: Line) => `${l[0]}${l[1]}`

// ───────────── малюнок куба ─────────────

const CUBE: Record<string, [number, number]> = {
  A: [0, 0],
  B: [3, 0],
  C: [4.2, 1],
  D: [1.2, 1],
  'A₁': [0, 3],
  'B₁': [3, 3],
  'C₁': [4.2, 4],
  'D₁': [1.2, 4],
}

function cubeFigure(opts: { line?: Line; lineColor?: Color; plane?: Plane; fill?: Color; caption?: string } = {}): Figure {
  const solid: Line[] = [['A', 'B'], ['B', 'C'], ['A', 'A₁'], ['B', 'B₁'], ['C', 'C₁'], ['A₁', 'B₁'], ['B₁', 'C₁'], ['C₁', 'D₁'], ['A₁', 'D₁']]
  const hidden: Line[] = [['A', 'D'], ['D', 'C'], ['D', 'D₁']]
  const items: FigureItem[] = []
  if (opts.plane) items.push({ t: 'poly', pts: opts.plane.verts, fill: opts.fill ?? 'orange', stroke: false })
  for (const [a, b] of solid) items.push({ t: 'seg', a, b })
  for (const [a, b] of hidden) items.push({ t: 'seg', a, b, style: 'dashed' })
  if (opts.line) items.push({ t: 'seg', a: opts.line[0], b: opts.line[1], style: 'bold', color: opts.lineColor ?? 'red' })
  return figure(CUBE, items, {
    width: 300,
    caption: opts.caption,
    labelOffsets: { 'B₁': [-14, 14], D: [-2, 14], 'D₁': [-10, -12], C: [4, 4] },
  })
}

// ───────────── малюнки для теорії ─────────────

const lineParallelFigure: Figure = figure(
  { a: [6.3, 2.0], b: [6.3, 0.8] },
  [
    { t: 'poly', pts: [[0, 0], [6, 0], [7.5, 2], [1.5, 2]], fill: 'ink' },
    { t: 'line', a: [0.8, 1.0], b: [6.8, 1.0], color: 'green' },
    { t: 'line', a: [0.8, 2.8], b: [6.8, 2.8], color: 'red' },
    { t: 'text', at: [7.0, 2.9], text: 'a', size: 18, color: 'red' },
    { t: 'text', at: [7.1, 1.1], text: 'b', size: 18, color: 'green' },
    { t: 'text', at: [0.1, 0.25], text: 'α', size: 20 },
  ],
  {
    width: 360,
    extra: [[0, -0.5], [8, 3.2]],
    caption: 'Пряма $a$ не лежить у площині $\\alpha$, але паралельна прямій $b$, що лежить в $\\alpha$. Тоді $a\\parallel\\alpha$.',
  },
)

const planesFigure: Figure = figure(
  {},
  [
    { t: 'poly', pts: [[0, 0], [6, 0], [7.5, 2], [1.5, 2]], fill: 'ink' },
    { t: 'poly', pts: [[0, 2.6], [6, 2.6], [7.5, 4.6], [1.5, 4.6]], fill: 'orange' },
    { t: 'text', at: [0.4, 0.3], text: 'α', size: 20 },
    { t: 'text', at: [0.4, 2.9], text: 'β', size: 20, color: 'orange' },
  ],
  { width: 340, extra: [[-0.3, -0.3], [7.8, 4.9]], caption: 'Паралельні площини $\\alpha$ і $\\beta$ не мають спільних точок.' },
)

const sectionFigure = cubeFigure({
  plane: SECTIONS[2],
  fill: 'orange',
  line: ['D', 'C'],
  lineColor: 'green',
  caption: 'Переріз $ABC_1D_1$ (помаранчевий) і ребро $DC$ (зелене). Ребро $DC$ паралельне ребру $AB$, що лежить у перерізі, а саме $DC$ у перерізі не лежить. Отже, $DC\\parallel(ABC_1D_1)$.',
})

export default topic('g10-1', {
  id: 'g10-line-plane-parallel',
  title: 'Паралельність прямої і площини; паралельність площин',
  summary:
    'Коли пряма «не торкається» площини і коли дві площини не мають спільних точок: ознаки, властивості та задачі на кубі й піраміді.',
  prereqs: ['g10-lines-space'],
  estMinutes: 45,
  lesson: [
    {
      title: '1. Пряма і площина: три випадки',
      blocks: [
        {
          type: 'intuition',
          md: 'Уяви стіл (площина) і олівець (пряма). Олівець може: **лежати** на столі; **стирчати** з нього (перетинати стіл в одній точці); **висіти** над столом, паралельно стільниці, ніде її не торкаючись. У геометрії це три єдино можливі випадки.',
        },
        {
          type: 'definition',
          term: 'Взаємне розміщення прямої і площини',
          md: 'Пряма $a$ і площина $\\alpha$ можуть:\n\n1. **Лежати в площині** ($a\\subset\\alpha$): усі точки прямої в площині (достатньо двох, за аксіомою).\n2. **Перетинатися** ($a\\cap\\alpha=M$): рівно **одна** спільна точка.\n3. **Бути паралельними** ($a\\parallel\\alpha$): **немає** жодної спільної точки.',
        },
        { type: 'figure', figure: lineParallelFigure },
        {
          type: 'rule',
          title: 'Ознака паралельності прямої і площини',
          md: 'Якщо пряма $a$ **не лежить** у площині $\\alpha$ і паралельна **якійсь** прямій $b$, що лежить в $\\alpha$, то $a\\parallel\\alpha$.',
        },
        {
          type: 'text',
          md: '**Доведення (від супротивного).** Прямі $a$ і $b$ паралельні, тому лежать в одній площині $\\beta$. Припустимо, що $a$ перетинає $\\alpha$ в точці $M$. Тоді $M$ лежить у $\\beta$ та в $\\alpha$, тож площини $\\alpha$ і $\\beta$ перетинаються по прямій, що проходить через $M$. Ця пряма — $b$ (вона спільна для $\\alpha$ і $\\beta$), і $M$ має лежати на $b$. Отже, $M\\in a$ і $M\\in b$, а це суперечить паралельності $a$ і $b$ (спільних точок у них немає). Значить, $a$ і $\\alpha$ не мають спільних точок. $\\blacksquare$',
        },
        {
          type: 'rule',
          title: 'Властивість',
          md: 'Якщо пряма $a$ паралельна площині $\\alpha$, а площина $\\beta$ проходить через $a$ і перетинає $\\alpha$ по прямій $c$, то $c\\parallel a$.',
        },
        {
          type: 'text',
          md: 'Справді, $a$ і $c$ лежать в одній площині $\\beta$. Спільних точок вони не мають, бо $c\\subset\\alpha$, а $a$ з $\\alpha$ точок не має. Дві прямі в одній площині без спільних точок — паралельні.',
        },
        {
          type: 'warning',
          md: 'Ознака працює лише так: потрібна пряма **в площині**. Якщо пряма $a$ паралельна прямій $b$, яка сама **не лежить** в $\\alpha$, нічого сказати не можна: $a$ може і лежати в $\\alpha$, і перетинати її.',
        },
        {
          type: 'check',
          question: 'У кубі $ABCDA_1B_1C_1D_1$ чи паралельне ребро $AB$ площині $(A_1B_1C_1)$?',
          answer: 'Так.',
          explain: '$AB\\parallel A_1B_1$, а $A_1B_1$ лежить у площині верхньої грані. Саме $AB$ у цій площині не лежить (воно в нижній основі). За ознакою $AB\\parallel(A_1B_1C_1)$.',
        },
      ],
    },
    {
      title: '2. Паралельні площини',
      blocks: [
        {
          type: 'definition',
          term: 'Паралельні площини',
          md: 'Дві площини **паралельні**, якщо вони **не мають спільних точок**. Якщо ж у них є спільна точка, вони (за аксіомою) перетинаються по прямій.',
        },
        { type: 'figure', figure: planesFigure },
        {
          type: 'rule',
          title: 'Ознака паралельності площин',
          md: 'Якщо дві прямі, що **перетинаються** і лежать в одній площині, відповідно паралельні двом прямим другої площини, то ці площини паралельні.',
        },
        {
          type: 'text',
          md: '**Доведення.** Нехай $a,b\\subset\\alpha$ перетинаються в точці $M$, а $a_1,b_1\\subset\\beta$ — прямі, що $a\\parallel a_1$, $b\\parallel b_1$. За ознакою паралельності прямої і площини $a\\parallel\\beta$ та $b\\parallel\\beta$. Припустимо, що $\\alpha$ і $\\beta$ перетинаються по прямій $c$. За властивістю прямої, паралельної площині, $a\\parallel c$ і $b\\parallel c$. Тоді через точку $M$ проходять дві різні прямі $a$ і $b$, обидві паралельні $c$. Але через точку поза прямою проходить лише одна паралельна їй. Суперечність. Отже, $\\alpha\\parallel\\beta$. $\\blacksquare$',
        },
        {
          type: 'rule',
          title: 'Властивості паралельних площин',
          md: '1. Через точку поза даною площиною проходить **єдина** площина, паралельна даній.\n2. Якщо дві паралельні площини перетнути третьою, то **лінії перетину паралельні**.\n3. Відрізки паралельних прямих, що містяться між паралельними площинами, **рівні**.',
        },
        {
          type: 'text',
          md: '**Чому правда властивість 3.** Нехай паралельні прямі $AA_1$ і $BB_1$ перетинають паралельні площини $\\alpha$ ($A,B$) і $\\beta$ ($A_1,B_1$). Площина, що містить ці дві прямі, перетинає $\\alpha$ і $\\beta$ по прямих $AB$ і $A_1B_1$, які паралельні за властивістю 2. Тоді чотирикутник $AA_1B_1B$ має по дві пари паралельних сторін — це паралелограм, тож $AA_1=BB_1$ і $AB=A_1B_1$.',
        },
        {
          type: 'tip',
          md: 'Паралельні площини — це як підлога і стеля в кімнаті. Будь-яка стіна перетинає їх по паралельних лініях (плінтус і край стелі), а стовпи між ними (вертикальні паралельні прямі) мають однакову довжину.',
        },
        {
          type: 'check',
          question: 'У кубі чи паралельні площини $(ABC)$ і $(A_1B_1C_1)$?',
          answer: 'Так.',
          explain: 'Це нижня й верхня основи куба. $AB\\parallel A_1B_1$ і $BC\\parallel B_1C_1$ — дві прямі, що перетинаються, паралельні двом прямим другої площини.',
        },
      ],
    },
    {
      title: '3. Як розв’язувати задачі',
      blocks: [
        { type: 'figure', figure: sectionFigure },
        {
          type: 'algorithm',
          title: 'Як довести, що пряма паралельна площині',
          steps: [
            'Переконайся, що пряма **не лежить** у площині (перевір точку).',
            'Знайди в площині **пряму, паралельну даній**. У многогранниках це часто протилежна сторона паралелограма чи середня лінія трикутника.',
            'Запиши ознаку: пряма поза площиною, паралельна прямій у площині, отже паралельна площині.',
          ],
        },
        {
          type: 'algorithm',
          title: 'Як довести, що площини паралельні',
          steps: [
            'У першій площині знайди **дві прямі, що перетинаються**.',
            'Для кожної з них знайди **паралельну** їй пряму в другій площині.',
            'Застосуй ознаку паралельності площин.',
          ],
        },
        {
          type: 'rule',
          title: 'Подібність у задачах на піраміду',
          md: 'Якщо площина паралельна основі піраміди $SABC$ і перетинає ребра $SA$, $SB$, $SC$ у точках $A_1$, $B_1$, $C_1$, то трикутник $A_1B_1C_1$ **подібний** $ABC$ з коефіцієнтом $k=\\dfrac{SA_1}{SA}$. Тому $A_1B_1=k\\cdot AB$.',
        },
        {
          type: 'warning',
          md: 'Не плутай: «паралельна площині» — це не «паралельна **кожній** прямій у площині». Пряма, паралельна площині, паралельна лише деяким прямим у ній (тим, що в напрямку); інші прямі площини для неї **мимобіжні**.',
        },
        {
          type: 'check',
          question: 'Скільки граней куба паралельні ребру $AB$?',
          answer: '$2$ грані: $A_1B_1C_1D_1$ і $DCC_1D_1$.',
          explain: 'Ребро лежить у гранях $ABCD$ і $ABB_1A_1$ (2), перетинає грані $ADD_1A_1$ і $BCC_1B_1$ (2) та паралельне двом іншим (2).',
        },
      ],
    },
  ],
  examples: [
    {
      title: 'Пряма паралельна площині',
      problem: 'У кубі $ABCDA_1B_1C_1D_1$ доведи, що $A_1D\\parallel(BCC_1)$.',
      steps: [
        { think: 'Шукаємо в площині $(BCC_1)$ (це грань $BCC_1B_1$) пряму, паралельну $A_1D$. Діагональ $A_1D$ лежить у лівій грані. Протилежна їй діагональ — $B_1C$ у правій грані.', do: '$A_1D\\parallel B_1C$ (протилежні сторони прямокутника $A_1B_1CD$).' },
        { think: '$B_1C$ лежить у площині $(BCC_1)$, а сама $A_1D$ у цій площині не лежить (вона в протилежній грані).', do: '$A_1D\\notin(BCC_1)$, $B_1C\\subset(BCC_1)$.' },
        { think: 'Застосовуємо ознаку.', do: '$A_1D\\parallel(BCC_1)$.' },
      ],
      answer: 'Доведено: $A_1D\\parallel(BCC_1)$.',
    },
    {
      title: 'Середня лінія і площина',
      problem: 'У тетраедрі $DABC$ точки $M$ і $N$ — середини ребер $DA$ і $DB$. Доведи, що $MN\\parallel(ABC)$.',
      steps: [
        { think: '$MN$ — середня лінія трикутника $DAB$, тому $MN\\parallel AB$.', do: '$MN\\parallel AB$.' },
        { think: 'Пряма $AB$ лежить у площині $(ABC)$, а $MN$ у цій площині не лежить (точка $M$ на ребрі $DA$ поза площиною $ABC$).', do: '$MN\\not\\subset(ABC)$.' },
        { think: 'За ознакою пряма $MN$ паралельна площині.', do: '$MN\\parallel(ABC)$.' },
      ],
      answer: 'Доведено.',
    },
    {
      title: 'Паралельні площини і відрізки',
      problem: 'Паралельні площини $\\alpha$ і $\\beta$ перетнуті паралельними прямими: $A,B\\in\\alpha$, $A_1,B_1\\in\\beta$. Відомо, що $AA_1=9$ см, $A_1B_1=14$ см. Знайди $BB_1$ і $AB$.',
      steps: [
        { think: 'Відрізки паралельних прямих між паралельними площинами рівні: $AA_1B_1B$ — паралелограм.', do: '$BB_1=AA_1=9$ см.' },
        { think: 'У паралелограма протилежні сторони рівні: $AB=A_1B_1$.', do: '$AB=14$ см.' },
      ],
      answer: '$BB_1=9$ см, $AB=14$ см.',
    },
    {
      title: 'Переріз піраміди, паралельний основі',
      problem: 'Площина, паралельна основі піраміди $SABC$, перетинає ребра $SA$, $SB$, $SC$ у точках $A_1$, $B_1$, $C_1$. Відомо, що $SA_1:A_1A=2:3$ і $AB=15$ см. Знайди $A_1B_1$.',
      steps: [
        { think: 'Відношення від вершини: $SA_1:SA$. Бо $SA_1:A_1A=2:3$, то $SA=2+3=5$ частин, $SA_1=2$ частини.', do: '$k=\\dfrac{SA_1}{SA}=\\dfrac{2}{5}$.' },
        { think: 'Площина паралельна основі, тому $A_1B_1\\parallel AB$ і $\\triangle SA_1B_1\\sim\\triangle SAB$ з коефіцієнтом $k$.', do: '$A_1B_1=k\\cdot AB=\\dfrac{2}{5}\\cdot 15$.' },
        { think: 'Рахуємо.', do: '$A_1B_1=6$ см.' },
      ],
      answer: '$A_1B_1=6$ см.',
    },
  ],
  formulas: [
    { title: 'Три розміщення прямої і площини', tex: 'a\\subset\\alpha,\\quad a\\cap\\alpha=M,\\quad a\\parallel\\alpha' },
    { title: 'Ознака $a\\parallel\\alpha$', tex: 'a\\not\\subset\\alpha,\\ b\\subset\\alpha,\\ a\\parallel b\\ \\Rightarrow\\ a\\parallel\\alpha' },
    { title: 'Ознака $\\alpha\\parallel\\beta$', tex: 'a,b\\subset\\alpha,\\ a\\cap b,\\ a\\parallel a_1,\\ b\\parallel b_1\\ (a_1,b_1\\subset\\beta)\\ \\Rightarrow\\ \\alpha\\parallel\\beta' },
    { title: 'Відрізки між паралельними площинами', tex: 'AA_1\\parallel BB_1\\ \\Rightarrow\\ AA_1=BB_1,\\ AB=A_1B_1' },
    { title: 'Переріз піраміди, паралельний основі', tex: 'k=\\dfrac{SA_1}{SA},\\quad A_1B_1=k\\cdot AB' },
    { title: 'Ребра куба відносно граней', tex: '2\\ \\text{лежить},\\ 2\\ \\text{перетинає},\\ 2\\ \\text{паралельне}' },
  ],
  mistakes: [
    {
      wrong: 'Пряма $a$ паралельна прямій $b$, яка паралельна площині $\\alpha$. Значить, $a\\parallel\\alpha$.',
      why: '$a$ може лежати в $\\alpha$ (наприклад, $b$ — «зсув» $a$ над площиною).',
      right: 'Ознака вимагає пряму **в площині**, паралельну $a$, а також що $a\\not\\subset\\alpha$.',
    },
    {
      wrong: 'Пряма, паралельна площині, паралельна **всім** прямим у цій площині.',
      why: 'Паралельна лише тим, що мають той самий напрямок; інші прямі площини для неї мимобіжні.',
      right: 'Серед прямих площини є паралельні й мимобіжні до даної прямої.',
    },
    {
      wrong: 'Дві площини мають спільну пряму, отже вони паралельні.',
      why: 'Паралельні площини **не мають жодної спільної точки**.',
      right: 'Площини з спільною прямою перетинаються.',
    },
    {
      wrong: 'Дві площини, у кожній з яких є по прямій, і ці прямі паралельні, — паралельні.',
      why: 'Для ознаки потрібні **дві прямі, що перетинаються**. Одна пряма не фіксує площину.',
      right: 'Достатньо двох прямих, що перетинаються, відповідно паралельних двом прямим другої площини.',
    },
    {
      wrong: 'У задачі про переріз піраміди взяли $k=\\dfrac{SA_1}{A_1A}$.',
      why: 'Коефіцієнт подібності — відношення **від вершини до всієї** сторони.',
      right: '$k=\\dfrac{SA_1}{SA}$.',
    },
  ],
  exercises: [
    // ───── 1 ─────
    exercise('lp-concept', 1, 'Взаємне розміщення прямої і площини за умовою', (rng) => {
      const [a] = rng.pick([['a'], ['m'], ['p'], ['l']])
      const inP = 'Пряма лежить у площині'
      const cross = 'Пряма перетинає площину'
      const par = 'Пряма паралельна площині'
      const scen = [
        { q: `Пряма $${a}$ і площина $\\alpha$ мають рівно одну спільну точку.`, ans: cross },
        { q: `Пряма $${a}$ і площина $\\alpha$ не мають жодної спільної точки.`, ans: par },
        { q: `Дві різні точки прямої $${a}$ лежать у площині $\\alpha$.`, ans: inP },
        { q: `Пряма $${a}$ не лежить у площині $\\alpha$ і паралельна прямій $b$, що лежить в $\\alpha$.`, ans: par },
      ]
      const s = rng.pick(scen)
      return {
        prompt: `${s.q} Яке розміщення прямої $${a}$ і площини $\\alpha$?`,
        answer: choiceAnswer(rng, s.ans, [inP, cross, par]),
        hints: ['Пригадай три випадки: лежить, перетинає (одна точка), паралельна (жодної).', 'Для останньої умови скористайся ознакою паралельності прямої і площини.'],
        solution: [s.ans === inP ? 'Дві точки прямої в площині — за аксіомою вся пряма лежить у ній.' : s.ans === cross ? 'Одна спільна точка — це перетин.' : 'Жодної спільної точки (або ознака) — пряма паралельна площині.'],
      }
    }),

    // ───── 2 ─────
    exercise('cube-line-plane', 2, 'Пряма і площина в кубі', (rng) => {
      const rel = rng.pick(['in', 'parallel', 'intersect'] as const)
      const cand: [Line, Plane][] = []
      for (const l of LINES) for (const p of PLANES) if (relLP(l, p) === rel) cand.push([l, p])
      const [l, p] = rng.pick(cand)
      const label = { in: 'Пряма лежить у площині', parallel: 'Пряма паралельна площині', intersect: 'Пряма перетинає площину' }
      const planeName = p.face ? `$(${p.name})$ (грань куба)` : `$(${p.name})$ (діагональний переріз)`
      return {
        prompt: `У кубі $ABCDA_1B_1C_1D_1$ розглянь пряму ${nm(l)} і площину ${planeName}. Яке їхнє взаємне розміщення?`,
        figure: cubeFigure({ line: l, plane: p, fill: 'orange' }),
        answer: choiceAnswer(rng, label[rel], Object.values(label)),
        hints: [
          `Чи лежать обидві точки ${l[0]} і ${l[1]} в площині? Якщо так, пряма лежить у ній.`,
          'Якщо лише одна — пряма перетинає площину. Якщо жодна — шукай у площині паралельну пряму (протилежна сторона прямокутника, діагональ у протилежній грані).',
        ],
        solution: [
          `Вершини площини: ${p.verts.join(', ')}.`,
          rel === 'in' ? `Обидві точки ${l[0]} і ${l[1]} належать площині, тому пряма лежить у ній.` : rel === 'intersect' ? 'Пряма має з площиною рівно одну спільну точку, тож перетинає її.' : 'Пряма не має спільних точок із площиною. Вона паралельна якійсь прямій у площині (напр., протилежному ребру чи діагоналі).',
        ],
      }
    }),

    // ───── 3 ─────
    exercise('count-faces-relation', 2, 'Скільки граней куба у даному розміщенні з прямою', (rng) => {
      const l = rng.pick(LINES)
      const rel = rng.pick(['in', 'parallel', 'intersect'] as const)
      const value = FACES.filter((f) => relLP(l, f) === rel).length
      const verb = { in: 'містять пряму', parallel: 'паралельні прямій', intersect: 'перетинає пряма' }[rel]
      const isEdge = EDGES.some((e) => nm(e) === nm(l))
      return {
        prompt: `У кубі $ABCDA_1B_1C_1D_1$ розглянь ${isEdge ? 'ребро' : 'діагональ грані'} ${nm(l)}. Скільки з 6 граней куба ${verb}?`,
        figure: cubeFigure({ line: l }),
        answer: { kind: 'number', value },
        answerTex: String(value),
        hints: [
          'Переглянь по черзі всі 6 граней і для кожної визнач розміщення прямої та площини грані.',
          'Для ребра куба типовий розклад: 2 грані містять ребро, 2 перетинає, 2 паралельні.',
        ],
        solution: [`Перевіривши всі грані, отримуємо: ${verb} — $${value}$ граней.`],
      }
    }),

    // ───── 4 ─────
    exercise('cube-planes-relation', 2, 'Скільки граней куба паралельні або перетинають площину', (rng) => {
      const p = rng.pick(PLANES)
      const want = rng.pick(['parallel', 'intersect'] as const)
      const value = FACES.filter((f) => relPP(p, f) === want).length
      const verb = want === 'parallel' ? 'паралельні' : 'перетинають'
      return {
        prompt: `У кубі $ABCDA_1B_1C_1D_1$ розглянь площину $(${p.name})$ (${p.face ? 'грань куба' : 'діагональний переріз'}). Скільки з 6 граней куба ${verb} цю площину (не збігаються з нею)?`,
        figure: cubeFigure({ plane: p }),
        answer: { kind: 'number', value },
        answerTex: String(value),
        hints: [
          'Дві різні площини або паралельні (немає спільних точок), або перетинаються по прямій.',
          'Паралельною площині грані є протилежна грань. Діагональний переріз не паралельний жодній грані.',
        ],
        solution: [`Грані, ${verb} площини $(${p.name})$: $${value}$.`],
      }
    }),

    // ───── 5 ─────
    exercise('tetra-midline-plane', 2, 'Середня лінія і площина в тетраедрі', (rng) => {
      const [D, A, B, Cc] = rng.shuffle(['A', 'B', 'C', 'D', 'K', 'L', 'S', 'T']).slice(0, 4)
      const inP = 'Пряма лежить у площині'
      const par = 'Пряма паралельна площині'
      const cr = 'Пряма перетинає площину'
      const planes = [
        { name: `${A}${B}${Cc}`, ans: par },
        { name: `${D}${A}${B}`, ans: inP },
        { name: `${D}${B}${Cc}`, ans: cr },
        { name: `${D}${A}${Cc}`, ans: cr },
      ]
      const pl = rng.pick(planes)
      return {
        prompt: `У тетраедрі $${D}${A}${B}${Cc}$ точки $M$ і $N$ — середини ребер $${D}${A}$ і $${D}${B}$. Яке розміщення прямої $MN$ і площини $(${pl.name})$?`,
        answer: choiceAnswer(rng, pl.ans, [inP, par, cr]),
        hints: [
          `$MN$ — середня лінія трикутника $${D}${A}${B}$, тому $MN\\parallel ${A}${B}$.`,
          `Подивись, які з точок $M$, $N$ лежать у площині $(${pl.name})$ і чи містить площина пряму $${A}${B}$.`,
        ],
        solution: [
          `$MN\\parallel ${A}${B}$ (середня лінія).`,
          pl.ans === par ? `Площина $(${A}${B}${Cc})$ містить $${A}${B}$, а $MN$ у ній не лежить: за ознакою $MN\\parallel(${A}${B}${Cc})$.` : pl.ans === inP ? `Обидві точки $M$ і $N$ лежать у площині грані $${D}${A}${B}$, тому $MN$ лежить у ній.` : `У площині $(${pl.name})$ лежить рівно одна з точок $M$, $N$, тож пряма перетинає площину в цій точці.`,
        ],
      }
    }),

    // ───── 6 ─────
    exercise('sign-line-plane', 1, 'Ознака паралельності прямої і площини', (rng) => {
      const [a, b] = rng.pick([['a', 'b'], ['m', 'n'], ['p', 'q'], ['k', 'l']])
      const par = 'Пряма паралельна площині'
      const inP = 'Пряма лежить у площині'
      const unknown = 'Однозначно визначити неможливо'
      const scen = [
        { q: `Пряма $${a}$ не лежить у площині $\\alpha$ і паралельна прямій $${b}$, яка лежить в $\\alpha$.`, ans: par },
        { q: `Пряма $${a}$ паралельна прямій $${b}$, яка лежить в $\\alpha$ (відомо лише це).`, ans: unknown },
        { q: `Пряма $${a}$ лежить у площині $\\alpha$.`, ans: inP },
      ]
      const s = rng.pick(scen)
      return {
        prompt: `${s.q} Що можна сказати про розміщення $${a}$ і $\\alpha$?`,
        answer: choiceAnswer(rng, s.ans, [par, inP, unknown]),
        hints: ['Ознака вимагає двох умов: пряма поза площиною і паралельна прямій у площині. Чи обидві виконані?'],
        solution: [s.ans === par ? 'Виконані обидві умови ознаки — пряма паралельна площині.' : s.ans === unknown ? 'Не відомо, чи лежить $' + a + '$ в площині: вона може бути паралельна площині, а може лежати в ній.' : 'За умовою пряма лежить у площині.'],
      }
    }),

    // ───── 7 ─────
    exercise('planes-concept', 1, 'Властивості паралельних площин (поняття)', (rng) => {
      const [P, Q] = rng.pick([['\\alpha', '\\beta'], ['\\beta', '\\gamma'], ['\\alpha', '\\gamma'], ['\\pi', '\\sigma'], ['\\sigma', '\\tau']])
      const R = rng.pick(['\\gamma', '\\delta', '\\omega', '\\varphi']).replace(new RegExp('^' + P.replace('\\', '\\\\') + '$'), '\\omega')
      const a = rng.pick(['a', 'b', 'm', 'p', 'l', 'c'])
      const M = rng.pick(['M', 'K', 'T', 'E'])
      const par = `Пряма паралельна площині $${Q}$`
      const inP = `Пряма лежить у площині $${Q}$`
      const cr = `Пряма перетинає площину $${Q}$`
      const one = 'Одна'
      const inf = 'Безліч'
      const scen = [
        { q: `Площини $${P}$ і $${Q}$ паралельні, пряма $${a}$ лежить у $${P}$. Яке розміщення $${a}$ і $${Q}$?`, ans: par, opts: [par, inP, cr] },
        { q: `Скільки існує площин, паралельних даній площині $${P}$, що проходять через точку $${M}$ поза $${P}$?`, ans: one, opts: [one, inf, 'Жодної'] },
        { q: `Паралельні площини $${P}$ і $${Q}$ перетнуті третьою площиною $${R}$. Яке розміщення ліній перетину?`, ans: 'Паралельні', opts: ['Паралельні', 'Перетинаються', 'Мимобіжні'] },
      ]
      const s = rng.pick(scen)
      return {
        prompt: s.q,
        answer: choiceAnswer(rng, s.ans, s.opts.filter((o) => o !== s.ans)),
        hints: ['Згадай властивості паралельних площин: пряма в одній площині паралельна другій; лінії перетину третьою площиною паралельні; через точку — єдина паралельна площина.'],
        solution: ['Це пряма властивість паралельних площин.'],
      }
    }),

    // ───── 8 ─────
    exercise('between-planes', 2, 'Відрізки паралельних прямих між паралельними площинами', (rng) => {
      const aa = rng.int(4, 18)
      const ab = rng.int(4, 18)
      const askBB = rng.chance(0.5)
      const [A, B] = rng.pick([['A', 'B'], ['M', 'N'], ['K', 'L']])
      const value = askBB ? aa : ab
      return {
        prompt: `Паралельні площини $\\alpha$ і $\\beta$ перетнуті паралельними прямими $${A}${A}_1$ та $${B}${B}_1$ (точки $${A},${B}\\in\\alpha$, $${A}_1,${B}_1\\in\\beta$). Відомо, що $${A}${A}_1=${aa}$ см, $${A}_1${B}_1=${ab}$ см. Знайди ${askBB ? `$${B}${B}_1$` : `$${A}${B}$`} (у см).`,
        answer: { kind: 'number', value },
        answerTex: String(value),
        hints: ['Відрізки паралельних прямих між паралельними площинами рівні.', `Чотирикутник $${A}${A}_1${B}_1${B}$ — паралелограм. У паралелограма протилежні сторони рівні.`],
        solution: [`$${A}${A}_1${B}_1${B}$ — паралелограм, тож ${askBB ? `$${B}${B}_1=${A}${A}_1=${aa}$` : `$${A}${B}=${A}_1${B}_1=${ab}$`} см.`],
      }
    }),

    // ───── 9 ─────
    exercise('pyramid-section', 3, 'Переріз піраміди, паралельний основі', (rng) => {
      const m = rng.int(1, 4)
      const n = rng.int(1, 5)
      const total = m + n
      const mult = rng.int(2, 5)
      const AB = total * mult
      const value = m * mult
      const [S, A, B, A1, B1] = ['S', 'A', 'B', 'A₁', 'B₁']
      void S; void A; void B; void A1; void B1
      return {
        prompt: `Площина, паралельна основі піраміди $SABC$, перетинає ребра $SA$ і $SB$ в точках $A_1$ і $B_1$. Відомо, що $SA_1:A_1A=${m}:${n}$ і $AB=${AB}$ см. Знайди $A_1B_1$ (у см).`,
        answer: { kind: 'number', value },
        answerTex: String(value),
        hints: [
          'Знайди коефіцієнт подібності: $k=\\dfrac{SA_1}{SA}$. Якщо $SA_1:A_1A=m:n$, то $SA$ містить $m+n$ частин.',
          '$A_1B_1\\parallel AB$ (площина паралельна основі), тож трикутники $SA_1B_1$ і $SAB$ подібні.',
        ],
        solution: [
          `$SA$ складається з $${m}+${n}=${total}$ частин, $SA_1$ — ${m} частин, тому $k=\\dfrac{${m}}{${total}}$.`,
          `$A_1B_1=k\\cdot AB=\\dfrac{${m}}{${total}}\\cdot ${AB}=${value}$ см.`,
        ],
        steps: [
          {
            prompt: 'Скільки рівних частин містить відрізок $SA$ (якщо $SA_1:A_1A=m:n$)?',
            answer: { kind: 'number', value: total },
            hint: '$m+n$.',
            explanation: `$${m}+${n}=${total}$.`,
          },
          {
            prompt: `Знайди $A_1B_1$ у см, якщо $k=\\dfrac{${m}}{${total}}$ і $AB=${AB}$.`,
            answer: { kind: 'number', value },
            hint: '$A_1B_1=k\\cdot AB$.',
            explanation: `$\\dfrac{${m}}{${total}}\\cdot ${AB}=${value}$.`,
          },
        ],
      }
    }),

    // ───── 10 ─────
    exercise('through-point-plane', 1, 'Скільки прямих або площин через точку', (rng) => {
      const M = rng.pick(['M', 'K', 'P', 'T'])
      const inf = 'Безліч'
      const one = 'Одна'
      const none = 'Жодної'
      const scen = [
        { q: `Скільки існує площин, паралельних площині $\\alpha$, що проходять через точку $${M}$ поза $\\alpha$?`, ans: one },
        { q: `Скільки існує прямих, паралельних площині $\\alpha$, що проходять через точку $${M}$ поза $\\alpha$?`, ans: inf },
        { q: `Скільки існує прямих, що проходять через точку $${M}$ поза площиною $\\alpha$ і паралельні прямій $b$, яка лежить в $\\alpha$?`, ans: one },
      ]
      const s = rng.pick(scen)
      return {
        prompt: s.q,
        answer: choiceAnswer(rng, s.ans, [one, inf, none]),
        hints: ['Паралельна площині пряма може мати будь-який напрямок, що лежить «вздовж» площини. А паралельна площина через точку єдина.'],
        solution: [s.ans === one && s.q.includes('площин, паралельних') ? 'Через точку поза даною площиною проходить єдина площина, паралельна даній.' : s.ans === inf ? 'Достатньо провести пряму через $M$, паралельну будь-якій прямій площини $\\alpha$: таких прямих безліч.' : 'Паралельна $b$ пряма через $M$ єдина (аксіома паралельності в площині, заданій $M$ і $b$).'],
      }
    }),
  ],
})
