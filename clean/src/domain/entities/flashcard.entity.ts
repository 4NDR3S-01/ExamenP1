export class FlashcardEntity {

  constructor(
    public id: number,
    public question: string,
    public answer: string,
    public categories: string[],
    public difficulty: number = 1,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  public static fromObject(object: {[key: string]: any}): FlashcardEntity {
    const { id, question, answer, categories, difficulty, createdAt, updatedAt } = object;
    
    if (!id) throw new Error('Id is required');
    if (!question) throw new Error('Question is required');
    if (!answer) throw new Error('Answer is required');
    if (!categories || !Array.isArray(categories)) throw new Error('Categories must be an array');

    return new FlashcardEntity(
      id,
      question,
      answer,
      categories,
      difficulty ?? 1,
      createdAt ? new Date(createdAt) : new Date(),
      updatedAt ? new Date(updatedAt) : new Date()
    );
  }

  public hasCategory(category: string): boolean {
    return this.categories.includes(category);
  }

  public addCategory(category: string): void {
    if (!this.categories.includes(category)) {
      this.categories.push(category);
      this.updatedAt = new Date();
    }
  }

  public removeCategory(category: string): void {
    this.categories = this.categories.filter(cat => cat !== category);
    this.updatedAt = new Date();
  }

  public updateDifficulty(newDifficulty: number): void {
    if (newDifficulty >= 1 && newDifficulty <= 5) {
      this.difficulty = newDifficulty;
      this.updatedAt = new Date();
    }
  }
}
