import type { AppGenre } from "../../types/index.js";

export interface GenreGlossaryEntry {
  en: string[];
  de: string[];
  fr: string[];
  es: string[];
  ja: string[];
  ko: string[];
  "pt-BR": string[];
  it: string[];
  ru: string[];
  "zh-Hans": string[];
}

export const GENRE_GLOSSARIES: Record<AppGenre, GenreGlossaryEntry> = {
  "casual-game": {
    en: ["casual game", "puzzle", "match 3", "brain teaser", "offline play", "relaxing", "fun"],
    de: ["Casual Game", "Denkspiel", "3-Gewinnt", "Rätsel", "ohne Internet", "Entspannung"],
    fr: ["jeu casual", "casse-tête", "match 3", "jeu de réflexion", "hors ligne", "détente"],
    es: ["juego casual", "rompecabezas", "conecta 3", "acertijos", "sin internet", "relajante"],
    ja: ["暇つぶしゲーム", "パズル", "3マッチ", "脳トレ", "オフライン", "爽快パズル"],
    ko: ["캐주얼 게임", "퍼즐", "3매치", "두뇌 게임", "오프라인", "힐링 게임"],
    "pt-BR": ["jogo casual", "quebra-cabeça", "combinar 3", "passatempo", "sem internet", "relaxante"],
    it: ["gioco casual", "rompicapo", "match 3", "allena mente", "senza internet", "relax"],
    ru: ["казуальная игра", "головоломка", "три в ряд", "без интернета", "отдых"],
    "zh-Hans": ["休闲游戏", "益智解谜", "三消游戏", "单机离线", "解压放松"],
  },
  "puzzle": {
    en: ["puzzle solver", "logic games", "brain training", "mind games", "tile match", "strategy"],
    de: ["Rätsel lösen", "Logikspiele", "Gehirntraining", "Denkaufgaben", "Kacheln verbinden"],
    fr: ["résolution casse-tête", "jeux de logique", "entraînement cérébral", "tuiles à associer"],
    es: ["resolver puzzles", "juegos de lógica", "entrenar mente", "conectar fichas", "ingenio"],
    ja: ["パズル攻略", "ロジックゲーム", "脳力トレーニング", "タイルマッチ", "思考ゲーム"],
    ko: ["퍼즐 맞추기", "논리 게임", "두뇌 트레이닝", "타일 매치", "지능 계발"],
    "pt-BR": ["resolver quebra-cabeça", "jogos de lógica", "treino cerebral", "combinar blocos"],
    it: ["risolvi enigmi", "giochi di logica", "allena cervello", "combina tessere"],
    ru: ["логические игры", "тренировка мозга", "пазлы", "развитие мышления"],
    "zh-Hans": ["益智解谜", "逻辑思维", "脑力训练", "连连看", "方块消除"],
  },
  "rpg": {
    en: ["action RPG", "dungeon crawler", "hero quest", "level up", "loot", "character build"],
    de: ["Action RPG", "Dungeon Crawler", "Helden Quest", "Level aufsteigen", "Beute sammeln"],
    fr: ["action RPG", "donjons", "quête des héros", "monter de niveau", "butin", "compétences"],
    es: ["RPG de acción", "mazmorras", "misión de héroes", "subir nivel", "botín", "mejoras"],
    ja: ["アクションRPG", "ダンジョン探索", "英雄の冒険", "レベル上げ", "ハクスラ", "育成"],
    ko: ["액션 RPG", "던전 탐험", "영웅 모험", "레벨업", "아이템 파밍", "캐릭터 육성"],
    "pt-BR": ["RPG de ação", "explorar masmorras", "missão heróica", "subir de nível", "espólios"],
    it: ["GDR d'azione", "esplora dungeon", "missione eroe", "salire di livello", "equipaggiamento"],
    ru: ["ролевая игра", "подземелья", "приключения героев", "прокачка", "снаряжение"],
    "zh-Hans": ["动作角色扮演", "地牢探险", "英雄养成", "升级打宝", "冒险闯关"],
  },
  "action-game": {
    en: ["action packed", "battle arena", "shooter", "survival", "combat", "fast paced"],
    de: ["Action geladen", "Kampfarena", "Shooter", "Überleben", "Kampfspiel", "schnelle Action"],
    fr: ["action intense", "arène de combat", "jeu de tir", "survie", "combats épiques"],
    es: ["acción trepidante", "arena de batalla", "disparos", "supervivencia", "combate rápido"],
    ja: ["爽快アクション", "バトルアリーナ", "シューティング", "サバイバル", "白熱バトル"],
    ko: ["화려한 액션", "배틀 아레나", "슈팅 게임", "생존 액션", "스릴 전투"],
    "pt-BR": ["ação intensa", "arena de batalha", "jogo de tiro", "sobrevivência", "combate"],
    it: ["azione pura", "arena di combattimento", "sparatutto", "sopravvivenza", "combattimenti"],
    ru: ["динамичный экшен", "арена битв", "шутер", "выживание", "сражения"],
    "zh-Hans": ["刺激动作", "战斗竞技场", "射击对抗", "极限生存", "动作格斗"],
  },
  "strategy-game": {
    en: ["turn based strategy", "tactics", "build empire", "tower defense", "conquest"],
    de: ["Rundenstrategie", "Taktik", "Reich aufbauen", "Tower Defense", "Eroberung"],
    fr: ["stratégie au tour par tour", "tactique", "bâtir empire", "défense de tour", "conquête"],
    es: ["estrategia por turnos", "táctica", "construir imperio", "defensa de torres", "conquista"],
    ja: ["ターン制ストラテジー", "戦術バトル", "帝国建国", "タワーディフェンス", "領土拡大"],
    ko: ["턴제 전략", "전술 시뮬레이션", "제국 건설", "타워 디펜스", "영토 정복"],
    "pt-BR": ["estratégia por turnos", "táticas", "construir império", "tower defense", "conquista"],
    it: ["strategia a turni", "tattica", "costruisci impero", "difesa della torre"],
    ru: ["пошаговая стратегия", "тактика", "строительство империи", "защита башен"],
    "zh-Hans": ["回合制策略", "战术模拟", "帝国建设", "塔防闯关", "领土争霸"],
  },
  "productivity": {
    en: ["to-do list", "task manager", "daily planner", "habit tracker", "focus timer", "organizer"],
    de: ["To-Do Liste", "Aufgabenplaner", "Tagesplaner", "Gewohnheiten Tracker", "Fokus Timer"],
    fr: ["liste de tâches", "gestionnaire de tâches", "agenda quotidien", "suivi des habitudes", "minuteur focus"],
    es: ["lista de tareas", "gestor de tareas", "planificador diario", "seguimiento de hábitos", "temporizador"],
    ja: ["ToDoリスト", "タスク管理", "スケジュール手帳", "習慣トラッカー", "集中タイマー"],
    ko: ["할 일 목록", "일정 관리", "데일리 플래너", "습관 트래커", "집중 타이머"],
    "pt-BR": ["lista de tarefas", "gerenciador de tarefas", "agenda diária", "rastreador de hábitos", "foco"],
    it: ["lista di cose da fare", "gestione attività", "agenda giornaliera", "abitudini", "timer concentrazione"],
    ru: ["список дел", "планировщик задач", "ежедневник", "трекер привычек", "таймер фокуса"],
    "zh-Hans": ["待办清单", "任务管理", "日程规划", "习惯打卡", "专注番茄钟"],
  },
  "utility": {
    en: ["file manager", "cleaner", "storage optimizer", "speed test", "battery saver", "system tool"],
    de: ["Dateimanager", "Speicherbereinigung", "Speicher Optimierer", "Geschwindigkeitstest", "Werkzeug"],
    fr: ["gestionnaire de fichiers", "nettoyeur", "optimiseur de stockage", "test de vitesse", "utilitaire"],
    es: ["administrador de archivos", "limpiador", "liberar espacio", "test de velocidad", "herramienta"],
    ja: ["ファイル管理", "ストレージ最適化", "クリーンアップ", "スピードテスト", "便利ツール"],
    ko: ["파일 관리자", "저장공간 정리", "속도 측정", "배터리 최적화", "유틸리티"],
    "pt-BR": ["gerenciador de arquivos", "limpeza de memória", "liberar espaço", "otimizador de sistema"],
    it: ["gestione file", "pulizia memoria", "ottimizza spazio", "test velocità"],
    ru: ["файловый менеджер", "очистка памяти", "оптимизация хранилища", "тест скорости"],
    "zh-Hans": ["文件管理", "垃圾清理", "内存加速", "存储空间优化", "实用工具箱"],
  },
  "fitness": {
    en: ["workout tracker", "exercise log", "calorie counter", "step counter", "home workout", "gym"],
    de: ["Workout Tracker", "Fitness Tagebuch", "Kalorienzähler", "Schrittzähler", "Heimtraining"],
    fr: ["suivi entraînement", "journal fitness", "compteur calories", "podomètre", "sport maison"],
    es: ["registro de entrenamiento", "contador de calorías", "cuenta pasos", "ejercicio en casa", "gimnasio"],
    ja: ["筋トレ記録", "ワークアウト", "カロリー計算", "歩数計", "自宅フィットネス"],
    ko: ["운동 기록", "홈 트레이닝", "칼로리 계산기", "만보기", "헬스 다이어리"],
    "pt-BR": ["treino em casa", "registro de exercícios", "contador de calorias", "contador de passos", "academia"],
    it: ["allenamento a casa", "diario fitness", "conta calorie", "contapassi", "palestra"],
    ru: ["дневник тренировок", "фитнес дома", "счетчик калорий", "шагомер", "упражнения"],
    "zh-Hans": ["健身记录", "居家锻炼", "卡路里计算", "计步器", "减脂塑形"],
  },
  "finance": {
    en: ["budget planner", "expense tracker", "money manager", "spending tracker", "savings goal"],
    de: ["Haushaltsbuch", "Ausgaben Tracker", "Finanzplaner", "Geld sparen", "Budget Rechner"],
    fr: ["gestionnaire de budget", "suivi des dépenses", "gestion d'argent", "objectifs d'épargne"],
    es: ["control de gastos", "gestor de presupuesto", "administrador de dinero", "ahorrar dinero"],
    ja: ["家計簿アプリ", "支出管理", "お小遣い帳", "節約貯金", "資産管理"],
    ko: ["가계부", "지출 관리", "자산 관리", "용돈 기입장", "저축 목표"],
    "pt-BR": ["controle financeiro", "gestão de gastos", "planejador de orçamento", "poupar dinheiro"],
    it: ["gestione spese", "bilancio familiare", "risparmio", "pianificatore budget"],
    ru: ["учет расходов", "семейный бюджет", "контроль финансов", "копилка"],
    "zh-Hans": ["记账本", "日常开支", "预算管理", "理财记账", "存钱目标"],
  },
  "education": {
    en: ["language learning", "vocabulary builder", "study cards", "quiz", "flashcards", "learn fast"],
    de: ["Sprachen lernen", "Vokabeltrainer", "Lernkarten", "Quiz", "schneller lernen"],
    fr: ["apprentissage des langues", "vocabulaire", "fiches de révision", "quiz", "mémorisation"],
    es: ["aprender idiomas", "vocabulario", "tarjetas de estudio", "quiz", "memorización"],
    ja: ["語学学習", "単語帳", "暗記カード", "勉強クイズ", "効率学習"],
    ko: ["단어 암기", "외국어 학습", "공부 플래시카드", "학습 퀴즈"],
    "pt-BR": ["aprender idiomas", "vocabulário", "cartões de estudo", "quiz de aprendizado"],
    it: ["impara le lingue", "vocabolario", "schede di studio", "quiz formativo"],
    ru: ["изучение языков", "словарный запас", "карточки для запоминания", "тесты"],
    "zh-Hans": ["语言学习", "背单词", "记忆卡片", "知识问答", "高效学习"],
  },
  "entertainment": {
    en: ["streaming", "video player", "music", "audio", "podcasts", "creator content"],
    de: ["Streaming", "Videoplayer", "Musik hören", "Audio", "Podcasts"],
    fr: ["streaming vidéo", "lecteur vidéo", "musique", "podcasts", "contenu créateur"],
    es: ["streaming", "reproductor de video", "música", "podcasts", "entretenimiento"],
    ja: ["動画プレイヤー", "ストリーミング", "音楽鑑賞", "ポッドキャスト"],
    ko: ["동영상 플레이어", "스트리밍", "음악 감상", "팟캐스트"],
    "pt-BR": ["streaming", "reprodutor de vídeo", "música", "áudio e podcasts"],
    it: ["streaming", "lettore video", "musica", "podcast"],
    ru: ["видеоплеер", "стриминг", "музыка", "подкасты"],
    "zh-Hans": ["视频播放器", "在线流媒体", "音乐播客", "精彩影音"],
  },
};

export function getGlossaryForLocale(genre: AppGenre, locale: string): string[] {
  const entry = GENRE_GLOSSARIES[genre];
  if (!entry) return [];

  const langKey = locale as keyof GenreGlossaryEntry;
  if (entry[langKey]) return entry[langKey];

  const primaryLang = locale.split("-")[0] as keyof GenreGlossaryEntry;
  if (entry[primaryLang]) return entry[primaryLang];

  return entry.en;
}
