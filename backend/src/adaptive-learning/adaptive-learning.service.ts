import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StudentProfile, StudentProfileDocument }
  from '../users/schemas/student-profile.schema';
import { StudentPerformance, StudentPerformanceDocument }
  from './schemas/student-performance.schema';
import { Recommendation, RecommendationDocument }
  from './schemas/recommendation.schema';
import { LevelTest, LevelTestDocument }
  from './schemas/level-test.schema';
import { Question, QuestionDocument }
  from './schemas/question.schema';
import { CreateStudentProfileDto }
  from './dto/create-student-profile.dto';
import { CreateStudentPerformanceDto }
  from './dto/create-student-performance.dto';
import { CreateRecommendationDto }
  from './dto/create-recommendation.dto';
import { CreateQuestionDto }
  from './dto/create-question.dto';

@Injectable()
export class AdaptiveLearningService {

  constructor(
    @InjectModel(StudentProfile.name)
    private profileModel: Model<StudentProfileDocument>,
    @InjectModel(StudentPerformance.name)
    private performanceModel: Model<StudentPerformanceDocument>,
    @InjectModel(Recommendation.name)
    private recommendationModel: Model<RecommendationDocument>,
    @InjectModel(LevelTest.name)
    private levelTestModel: Model<LevelTestDocument>,
    @InjectModel(Question.name)
    private questionModel: Model<QuestionDocument>,
  ) { }

  // ══════════════════════════════════
  // STUDENT PROFILE CRUD
  // ══════════════════════════════════

  async createProfile(
    dto: CreateStudentProfileDto
  ): Promise<StudentProfile> {
    const profile = new this.profileModel(dto);
    return profile.save();
  }

  async findAllProfiles(): Promise<StudentProfile[]> {
    return this.profileModel.find().exec();
  }

  async findProfileByUserId(
    userId: string
  ): Promise<StudentProfile> {
    const profile = await this.profileModel
      .findOne({ userId }).exec();
    if (!profile)
      throw new NotFoundException(
        `Profile not found for user ${userId}`
      );
    return profile;
  }

  async updateProfile(
    userId: string,
    updateData: Partial<StudentProfile>
  ): Promise<StudentProfile> {
    const updated = await this.profileModel
      .findOneAndUpdate({ userId }, updateData, { new: true })
      .exec();
    if (!updated)
      throw new NotFoundException(
        `Profile not found for user ${userId}`
      );
    return updated;
  }

  async deleteProfile(userId: string): Promise<void> {
    await this.profileModel
      .findOneAndDelete({ userId }).exec();
  }

  // ══════════════════════════════════
  // STUDENT PERFORMANCE CRUD
  // ══════════════════════════════════

 async createPerformance(
  dto: CreateStudentPerformanceDto
): Promise<StudentPerformance & { adaptation?: any }> {
  // ── Sauvegarde la performance ──
  const performance = new this.performanceModel(dto);
  await performance.save();

  // ── Déclenche l'adaptation automatiquement ──
  try {
    const adaptation = await this.adaptDifficulty(dto.studentId);
    const result = performance.toObject() as any;
    result.adaptation = adaptation;
    return result;
  } catch {
    return performance.toObject() as any;
  }
}

  async findAllPerformances(): Promise<StudentPerformance[]> {
    return this.performanceModel.find().exec();
  }

  async findPerformanceByStudent(
    studentId: string
  ): Promise<StudentPerformance[]> {
    return this.performanceModel
      .find({ studentId })
      .sort({ attemptDate: -1 })
      .exec();
  }

  async deletePerformance(id: string): Promise<void> {
    await this.performanceModel.findByIdAndDelete(id).exec();
  }

  async getAverageScore(studentId: string): Promise<number> {
    const result = await this.performanceModel.aggregate([
      { $match: { studentId } },
      { $group: { _id: null, avg: { $avg: '$score' } } }
    ]);
    return result[0]?.avg || 0;
  }



  // ══════════════════════════════════
// DIFFICULTY ADAPTATION ALGORITHM
// ══════════════════════════════════

async adaptDifficulty(studentId: string): Promise<{
  previousLevel: string;
  newLevel: string;
  reason: string;
  averageScore: number;
  performancesAnalyzed: number;
  action: 'UP' | 'DOWN' | 'KEEP';
}> {
  // ── 1. Récupère le profil actuel ──
  const profile = await this.profileModel
    .findOne({ userId: studentId }).exec();

  const currentLevel = profile?.level || 'beginner';

  // ── 2. Récupère les 5 dernières performances ──
  const recentPerformances = await this.performanceModel
    .find({ studentId })
    .sort({ attemptDate: -1 })
    .limit(5)
    .exec();

  // Pas assez de données → pas d'adaptation
  if (recentPerformances.length < 3) {
    return {
      previousLevel: currentLevel,
      newLevel: currentLevel,
      reason: `Not enough data to adapt. Need at least 3 performances, have ${recentPerformances.length}.`,
      averageScore: 0,
      performancesAnalyzed: recentPerformances.length,
      action: 'KEEP'
    };
  }

  // ── 3. Calcul du score moyen ──
  const totalScore = recentPerformances.reduce(
    (sum, p) => sum + p.score, 0
  );
  const averageScore = Math.round(
    totalScore / recentPerformances.length
  );

  // ── 4. Logique d'adaptation ──
  let newLevel = currentLevel;
  let action: 'UP' | 'DOWN' | 'KEEP' = 'KEEP';
  let reason = '';

  if (averageScore >= 80) {
    // Monte le niveau
    if (currentLevel === 'beginner') {
      newLevel = 'intermediate';
      action = 'UP';
      reason = `Excellent performance! Average score ${averageScore}% >= 80%. Promoted from Beginner to Intermediate.`;
    } else if (currentLevel === 'intermediate') {
      newLevel = 'advanced';
      action = 'UP';
      reason = `Outstanding performance! Average score ${averageScore}% >= 80%. Promoted from Intermediate to Advanced.`;
    } else {
      action = 'KEEP';
      reason = `Already at maximum level (Advanced). Keep up the great work with ${averageScore}% average!`;
    }

  } else if (averageScore <= 40) {
    // Descend le niveau
    if (currentLevel === 'advanced') {
      newLevel = 'intermediate';
      action = 'DOWN';
      reason = `Average score ${averageScore}% <= 40%. Level adjusted from Advanced to Intermediate to consolidate foundations.`;
    } else if (currentLevel === 'intermediate') {
      newLevel = 'beginner';
      action = 'DOWN';
      reason = `Average score ${averageScore}% <= 40%. Level adjusted from Intermediate to Beginner to rebuild core concepts.`;
    } else {
      action = 'KEEP';
      reason = `Already at minimum level (Beginner). Average score ${averageScore}%. Focus on improving fundamentals.`;
    }

  } else {
    // Maintient le niveau
    action = 'KEEP';
    reason = `Average score ${averageScore}% is between 40% and 80%. Current level (${currentLevel}) is appropriate. Keep practicing!`;
  }

  // ── 5. Met à jour le profil si changement ──
  if (newLevel !== currentLevel) {
    const newRiskLevel =
      averageScore >= 70 ? 'LOW' :
      averageScore >= 40 ? 'MEDIUM' : 'HIGH';

    await this.profileModel.findOneAndUpdate(
      { userId: studentId },
      {
        level: newLevel,
        risk_level: newRiskLevel,
        progress: averageScore,
      },
      { new: true }
    ).exec();
  }

  return {
    previousLevel: currentLevel,
    newLevel,
    reason,
    averageScore,
    performancesAnalyzed: recentPerformances.length,
    action
  };
}

// ── Adaptation par topic spécifique ──────────
async adaptDifficultyByTopic(
  studentId: string,
  topic: string
): Promise<{
  topic: string;
  currentLevel: string;
  suggestedDifficulty: string;
  averageScore: number;
  recommendation: string;
}> {
  // Récupère les performances sur ce topic
  const topicPerformances = await this.performanceModel
    .find({ studentId, topic })
    .sort({ attemptDate: -1 })
    .limit(5)
    .exec();

  const profile = await this.profileModel
    .findOne({ userId: studentId }).exec();

  const currentLevel = profile?.level || 'beginner';

  if (topicPerformances.length === 0) {
    return {
      topic,
      currentLevel,
      suggestedDifficulty: currentLevel,
      averageScore: 0,
      recommendation: `No performance data for topic "${topic}". Start with ${currentLevel} difficulty.`
    };
  }

  const avg = Math.round(
    topicPerformances.reduce((s, p) => s + p.score, 0) /
    topicPerformances.length
  );

  let suggestedDifficulty = currentLevel;
  let recommendation = '';

  if (avg >= 80) {
    suggestedDifficulty =
      currentLevel === 'beginner' ? 'intermediate' :
      currentLevel === 'intermediate' ? 'advanced' : 'advanced';
    recommendation = `Strong performance in ${topic} (${avg}%). Try harder exercises!`;
  } else if (avg <= 40) {
    suggestedDifficulty =
      currentLevel === 'advanced' ? 'intermediate' :
      currentLevel === 'intermediate' ? 'beginner' : 'beginner';
    recommendation = `Struggling with ${topic} (${avg}%). Review easier content first.`;
  } else {
    recommendation = `Good progress in ${topic} (${avg}%). Continue at current level.`;
  }

  return {
    topic,
    currentLevel,
    suggestedDifficulty,
    averageScore: avg,
    recommendation
  };
}



// ══════════════════════════════════════
// PERSONALIZED RECOMMENDATION v1 API
// ══════════════════════════════════════

async generateRecommendations(studentId: string): Promise<{
  recommendations: any[];
  profile: any;
  weakTopics: string[];
  strongTopics: string[];
  totalGenerated: number;
}> {
  // ── 1. Récupère le profil étudiant ──
  const profile = await this.profileModel
    .findOne({ userId: studentId }).exec();

  if (!profile) {
    throw new NotFoundException(
      `Profile not found for student ${studentId}`
    );
  }

  const currentLevel = profile.level || 'beginner';
  const weaknesses = profile.weaknesses || [];
  const strengths = profile.strengths || [];

  // ── 2. Analyse les performances récentes ──
  const recentPerformances = await this.performanceModel
    .find({ studentId })
    .sort({ attemptDate: -1 })
    .limit(10)
    .exec();

  // Calcul score moyen par topic
  const topicScores: Record<string, {
    total: number;
    count: number;
  }> = {};

  recentPerformances.forEach((p: any) => {
    const topic = p.topic || 'general';
    if (!topicScores[topic]) {
      topicScores[topic] = { total: 0, count: 0 };
    }
    topicScores[topic].total += p.score;
    topicScores[topic].count++;
  });

  // Topics faibles depuis performances (score < 60%)
const weakTopicsFromPerf = Object.entries(topicScores)
  .filter(([_, s]) =>
    Math.round(s.total / s.count) < 60
  )
  .map(([topic]) => topic);

// Topics améliorés récemment (score >= 60%)
// → ont priorité sur le level test
const improvedTopics = Object.entries(topicScores)
  .filter(([_, s]) =>
    Math.round(s.total / s.count) >= 60
  )
  .map(([topic]) => topic);

// Weak = dans profil weaknesses ET pas amélioré récemment
const allWeakTopics = [
  ...new Set([
    ...weaknesses.filter(
      (w: string) => !improvedTopics.includes(w)
    ),
    ...weakTopicsFromPerf
  ])
];

// Topics forts depuis performances (score >= 75%)
const strongTopicsFromPerf = Object.entries(topicScores)
  .filter(([_, s]) =>
    Math.round(s.total / s.count) >= 75
  )
  .map(([topic]) => topic);

// Strong = dans profil strengths OU performances récentes
// MAIS jamais dans weak (performances récentes ont priorité)
const allStrongTopics = [
  ...new Set([...strengths, ...strongTopicsFromPerf])
].filter(t => !allWeakTopics.includes(t));

  // ── 3. Supprime les anciennes recommandations ──
  await this.recommendationModel.deleteMany({
    studentId,
    isViewed: false
  }).exec();

  // ── 4. Génère les recommandations ──
  const recommendations: any[] = [];

  // 🔴 Priorité 1 : Topics faibles → exercices du niveau actuel
  for (const topic of allWeakTopics.slice(0, 3)) {
    const rec = await this.recommendationModel.create({
      studentId,
      recommendedContent: `${topic} — ${currentLevel} exercises`,
      reason: this.buildWeakReason(topic, currentLevel, topicScores[topic]),
      contentType: 'exercise',
      confidenceScore: this.calcConfidence(
        topicScores[topic], 'weak'
      ),
      isViewed: false,
      generatedAt: new Date(),
    });
    recommendations.push(rec);
  }

  // 🟡 Priorité 2 : Niveau actuel général
  if (recommendations.length < 2) {
    const rec = await this.recommendationModel.create({
      studentId,
      recommendedContent:
        `General ${currentLevel} practice exercises`,
      reason: `Based on your current level (${currentLevel}), these exercises will help consolidate your knowledge.`,
      contentType: 'exercise',
      confidenceScore: 70,
      isViewed: false,
      generatedAt: new Date(),
    });
    recommendations.push(rec);
  }

  // 🟢 Priorité 3 : Topics forts → exercices niveau supérieur
  const nextLevel =
    currentLevel === 'beginner' ? 'intermediate' :
    currentLevel === 'intermediate' ? 'advanced' :
    'advanced';

  for (const topic of allStrongTopics.slice(0, 2)) {
    const rec = await this.recommendationModel.create({
      studentId,
      recommendedContent: `${topic} — ${nextLevel} challenge`,
      reason: `You are strong in ${topic}! Try ${nextLevel} exercises to push your limits.`,
      contentType: 'course',
      confidenceScore: this.calcConfidence(
        topicScores[topic], 'strong'
      ),
      isViewed: false,
      generatedAt: new Date(),
    });
    recommendations.push(rec);
  }

  // 🔵 Priorité 4 : Si pas de données → recommandation par défaut
  if (recommendations.length === 0) {
    const defaultTopics = [
      'mathematics', 'sciences', 'computer-science'
    ];
    for (const topic of defaultTopics) {
      const rec = await this.recommendationModel.create({
        studentId,
        recommendedContent: `${topic} — ${currentLevel} starter`,
        reason: `Start your learning journey with ${topic} at ${currentLevel} level.`,
        contentType: 'exercise',
        confidenceScore: 60,
        isViewed: false,
        generatedAt: new Date(),
      });
      recommendations.push(rec);
    }
  }

  return {
    recommendations,
    profile: {
      level: currentLevel,
      weaknesses: allWeakTopics,
      strengths: allStrongTopics,
    },
    weakTopics: allWeakTopics,
    strongTopics: allStrongTopics,
    totalGenerated: recommendations.length,
  };
}

// ── Helpers privés ────────────────────────────

private buildWeakReason(
  topic: string,
  level: string,
  stat?: { total: number; count: number }
): string {
  if (stat && stat.count > 0) {
    const avg = Math.round(stat.total / stat.count);
    return `Your average score in ${topic} is ${avg}%. ` +
      `Practice more ${level} exercises to improve this area.`;
  }
  return `${topic} was detected as a weak area in your ` +
    `level test. Focus on ${level} exercises to improve.`;
}

private calcConfidence(
  stat?: { total: number; count: number },
  type?: 'weak' | 'strong'
): number {
  if (!stat || stat.count === 0) return 65;
  const avg = Math.round(stat.total / stat.count);
  if (type === 'weak') {
    // Plus le score est bas, plus on est confiant
    // que l'exercice est nécessaire
    return Math.min(95, 100 - avg);
  }
  // Plus le score est haut, plus on est confiant
  // que le challenge est approprié
  return Math.min(95, avg);
}


  // ══════════════════════════════════
  // RECOMMENDATION CRUD
  // ══════════════════════════════════

  async createRecommendation(
    dto: CreateRecommendationDto
  ): Promise<Recommendation> {
    const recommendation = new this.recommendationModel(dto);
    return recommendation.save();
  }

  async findRecommendationsByStudent(
    studentId: string
  ): Promise<Recommendation[]> {
    return this.recommendationModel
      .find({ studentId })
      .sort({ generatedAt: -1 })
      .exec();
  }

  async markRecommendationViewed(
    id: string
  ): Promise<Recommendation> {
    const rec = await this.recommendationModel
      .findByIdAndUpdate(id, { isViewed: true }, { new: true })
      .exec();
    if (!rec)
      throw new NotFoundException(
        `Recommendation ${id} not found`
      );
    return rec;
  }

  async deleteRecommendation(id: string): Promise<void> {
    await this.recommendationModel
      .findByIdAndDelete(id).exec();
  }

  // ══════════════════════════════════
  // QUESTION BANK CRUD
  // ══════════════════════════════════

  async createQuestion(dto: CreateQuestionDto): Promise<Question> {
    const question = new this.questionModel(dto);
    return question.save();
  }

  async findAllQuestions(): Promise<Question[]> {
    return this.questionModel.find().exec();
  }

  // ══════════════════════════════════
  // LEVEL TEST CRUD
  // ══════════════════════════════════

  async createLevelTest(studentId: string): Promise<any> {
    // 5 Beginner, 8 Intermediate, 7 Advanced
    const beginnerQs = await this.questionModel.aggregate([
      { $match: { difficulty: 'beginner' } },
      { $sample: { size: 5 } }
    ]);

    const intermediateQs = await this.questionModel.aggregate([
      { $match: { difficulty: 'intermediate' } },
      { $sample: { size: 8 } }
    ]);

    const advancedQs = await this.questionModel.aggregate([
      { $match: { difficulty: 'advanced' } },
      { $sample: { size: 7 } }
    ]);

    // Construct the test with the exact 10 dynamically sampled questions
    let selectedQuestions = [...beginnerQs, ...intermediateQs, ...advancedQs];

    // Fallback logic if database is empty 
   if (selectedQuestions.length === 0) {
  selectedQuestions = [
    // ── BEGINNER (6) ──────────────────────
    {
      questionText: "What does OOP stand for?",
      options: ["Object Oriented Programming", "Open Object Processing", "Ordered Output Program", "None"],
      correctAnswer: "Object Oriented Programming",
      topic: "OOP", difficulty: "beginner"
    },
    {
      questionText: "What is a variable in programming?",
      options: ["A fixed value", "A storage location with a name", "A function", "A loop"],
      correctAnswer: "A storage location with a name",
      topic: "programming", difficulty: "beginner"
    },
    {
      questionText: "What does HTML stand for?",
      options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "None"],
      correctAnswer: "Hyper Text Markup Language",
      topic: "web", difficulty: "beginner"
    },
    {
      questionText: "What is a primary key in databases?",
      options: ["A unique identifier for each record", "The first column", "An encrypted field", "A foreign reference"],
      correctAnswer: "A unique identifier for each record",
      topic: "databases", difficulty: "beginner"
    },
    {
      questionText: "What is a loop in programming?",
      options: ["A condition", "A repeated execution block", "A variable", "A function call"],
      correctAnswer: "A repeated execution block",
      topic: "programming", difficulty: "beginner"
    },
    {
      questionText: "What is CSS used for?",
      options: ["Database management", "Styling web pages", "Server logic", "Algorithms"],
      correctAnswer: "Styling web pages",
      topic: "web", difficulty: "beginner"
    },
    // ── INTERMEDIATE (8) ──────────────────
    {
      questionText: "What is the time complexity of binary search?",
      options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
      correctAnswer: "O(log n)",
      topic: "algorithms", difficulty: "intermediate"
    },
    {
      questionText: "What is inheritance in OOP?",
      options: ["Copying code", "A class acquiring properties of another", "A loop structure", "A data type"],
      correctAnswer: "A class acquiring properties of another",
      topic: "OOP", difficulty: "intermediate"
    },
    {
      questionText: "What is a REST API?",
      options: ["A database", "An architectural style for web services", "A programming language", "A UI framework"],
      correctAnswer: "An architectural style for web services",
      topic: "web", difficulty: "intermediate"
    },
    {
      questionText: "What is SQL used for?",
      options: ["Styling web pages", "Managing relational databases", "Building mobile apps", "Writing scripts"],
      correctAnswer: "Managing relational databases",
      topic: "databases", difficulty: "intermediate"
    },
    {
      questionText: "What is polymorphism?",
      options: ["Multiple forms of a function or object", "A loop type", "A database join", "A network protocol"],
      correctAnswer: "Multiple forms of a function or object",
      topic: "OOP", difficulty: "intermediate"
    },
    {
      questionText: "What is Big O notation?",
      options: ["A math formula", "A way to describe algorithm performance", "A database query", "A design pattern"],
      correctAnswer: "A way to describe algorithm performance",
      topic: "algorithms", difficulty: "intermediate"
    },
    {
      questionText: "What is a binary tree?",
      options: ["A tree with two roots", "A hierarchical structure where each node has at most 2 children", "A sorting algorithm", "A type of loop"],
      correctAnswer: "A hierarchical structure where each node has at most 2 children",
      topic: "algorithms", difficulty: "intermediate"
    },
    {
      questionText: "What is normalization in databases?",
      options: ["Encrypting data", "Organizing data to reduce redundancy", "Backing up data", "Indexing tables"],
      correctAnswer: "Organizing data to reduce redundancy",
      topic: "databases", difficulty: "intermediate"
    },
    // ── ADVANCED (6) ──────────────────────
    {
      questionText: "What is the CAP theorem?",
      options: ["Consistency, Availability, Partition tolerance", "Create, Alter, Partition", "Cache, Access, Process", "None"],
      correctAnswer: "Consistency, Availability, Partition tolerance",
      topic: "databases", difficulty: "advanced"
    },
    {
      questionText: "What is dynamic programming?",
      options: ["Writing code dynamically", "Solving problems by breaking them into overlapping subproblems", "A web framework", "A type of database"],
      correctAnswer: "Solving problems by breaking them into overlapping subproblems",
      topic: "algorithms", difficulty: "advanced"
    },
    {
      questionText: "What is microservices architecture?",
      options: ["A small computer", "An approach where an app is built as small independent services", "A CSS technique", "A database type"],
      correctAnswer: "An approach where an app is built as small independent services",
      topic: "programming", difficulty: "advanced"
    },
    {
      questionText: "What is a design pattern?",
      options: ["A UI template", "A reusable solution to a common software problem", "A database schema", "A CSS framework"],
      correctAnswer: "A reusable solution to a common software problem",
      topic: "programming", difficulty: "advanced"
    },
    {
      questionText: "What is SOLID in software engineering?",
      options: ["A database type", "5 principles of object-oriented design", "A testing framework", "A network protocol"],
      correctAnswer: "5 principles of object-oriented design",
      topic: "OOP", difficulty: "advanced"
    },
    {
      questionText: "What is the difference between SQL and NoSQL?",
      options: [
        "SQL is faster than NoSQL",
        "SQL uses structured tables, NoSQL uses flexible documents/key-value",
        "NoSQL is only for small projects",
        "They are the same"
      ],
      correctAnswer: "SQL uses structured tables, NoSQL uses flexible documents/key-value",
      topic: "databases", difficulty: "advanced"
    }
  ];
}

    const levelTest = new this.levelTestModel({
      studentId,
      questions: selectedQuestions
    });

    await levelTest.save();

    // Return to frontend with stripped 'correctAnswer' to prevent cheating
    const testObj = levelTest.toObject();
    testObj.questions = testObj.questions.map((q: any) => {
      const copy = { ...q };
      delete copy.correctAnswer;
      return copy;
    });

    return testObj;
  }

  async submitLevelTest(
  id: string,
  answers: any[]
): Promise<LevelTest> {
  const test = await this.levelTestModel.findById(id).exec();
  if (!test)
    throw new NotFoundException(`LevelTest ${id} not found`);

  let correct = 0;

  // ── Calcul des réponses ──────────────────
  const processedAnswers = answers.map((ans, index) => {
    const isCorrect =
      test.questions[index]?.correctAnswer === ans.selectedAnswer;
    if (isCorrect) correct++;
    return { ...ans, isCorrect };
  });

  // ── Score global ─────────────────────────
  const totalScore = Math.round(
    (correct / test.questions.length) * 100
  );

  const resultLevel =
    totalScore >= 70 ? 'advanced' :
    totalScore >= 40 ? 'intermediate' :
    'beginner';

  // ── Détection forces/faiblesses par topic ─
  const topicMap: Record<string, { correct: number; total: number }> = {};

  test.questions.forEach((q: any, index: number) => {
    const topic = q.topic || 'General';
    if (!topicMap[topic]) {
      topicMap[topic] = { correct: 0, total: 0 };
    }
    topicMap[topic].total++;
    if (processedAnswers[index]?.isCorrect) {
      topicMap[topic].correct++;
    }
  });

  // Force = topic avec score >= 70%
  const detectedStrengths = Object.entries(topicMap)
    .filter(([_, stat]) =>
      Math.round((stat.correct / stat.total) * 100) >= 70
    )
    .map(([topic, stat]) => ({
      topic,
      score: Math.round((stat.correct / stat.total) * 100),
      correct: stat.correct,
      total: stat.total
    }));

  // Faiblesse = topic avec score < 50%
  const detectedWeaknesses = Object.entries(topicMap)
    .filter(([_, stat]) =>
      Math.round((stat.correct / stat.total) * 100) < 50
    )
    .map(([topic, stat]) => ({
      topic,
      score: Math.round((stat.correct / stat.total) * 100),
      correct: stat.correct,
      total: stat.total
    }));

  // ── Mise à jour MongoDB ───────────────────
  const updated = await this.levelTestModel
    .findByIdAndUpdate(
      id,
      {
        answers: processedAnswers,
        totalScore,
        resultLevel,
        detectedStrengths,
        detectedWeaknesses,
        status: 'completed',
        completedAt: new Date()
      },
      { new: true }
    ).exec();

  if (!updated)
    throw new NotFoundException(`LevelTest ${id} not found`);

  // ── Met à jour le profil étudiant ─────────
  const existingProfile = await this.profileModel
  .findOne({ userId: test.studentId }).exec();

if (existingProfile) {
  //  Profil existe → mise à jour
  await this.profileModel.findOneAndUpdate(
    { userId: test.studentId },
    {
      level: resultLevel,
      strengths: detectedStrengths.map((s: any) => s.topic),
      weaknesses: detectedWeaknesses.map((w: any) => w.topic),
      levelTestCompleted: true,
      progress: totalScore,
    },
    { new: true }
  ).exec();
} else {
  //  Profil n'existe pas → création complète
  await this.profileModel.create({
    userId: test.studentId,
    academic_level: 'N/A',
    risk_level: totalScore >= 70 ? 'LOW' :
                totalScore >= 40 ? 'MEDIUM' : 'HIGH',
    points_gamification: 0,
    level: resultLevel,
    strengths: detectedStrengths.map((s: any) => s.topic),
    weaknesses: detectedWeaknesses.map((w: any) => w.topic),
    levelTestCompleted: true,
    progress: totalScore,
  });
}

  return updated;
}

  async findLevelTestByStudent(
    studentId: string
  ): Promise<any> {
    const test = await this.levelTestModel
      .findOne({ studentId })
      .sort({ createdAt: -1 })
      .exec();

    if (!test) return null;

    // Strip out correctAnswer if the test is still in-progress
    const testObj = test.toObject();
    if (testObj.status === 'in-progress') {
      testObj.questions = testObj.questions.map((q: any) => {
        const copy = { ...q };
        delete copy.correctAnswer;
        return copy;
      });
    }

    return testObj;
  }
}