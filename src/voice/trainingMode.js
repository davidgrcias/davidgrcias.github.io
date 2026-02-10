/**
 * Voice Training Mode
 * Allows users to train custom voice commands
 */

import { parseUtterance } from './nluParser';

export class VoiceTrainingMode {
  constructor(commandRegistry) {
    this.registry = commandRegistry;
    this.trainingData = this.loadTrainingData();
    this.accuracyStats = {};
  }
  
  /**
   * Load saved training data from localStorage
   */
  loadTrainingData() {
    try {
      const data = localStorage.getItem('voice_training_data');
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Failed to load training data:', error);
      return {};
    }
  }
  
  /**
   * Save training data to localStorage
   */
  saveTrainingData() {
    try {
      localStorage.setItem('voice_training_data', JSON.stringify(this.trainingData));
    } catch (error) {
      console.error('Failed to save training data:', error);
    }
  }
  
  /**
   * Add training utterance for a command
   */
  trainCommand(intent, utterance, entities = {}) {
    if (!this.trainingData[intent]) {
      this.trainingData[intent] = {
        utterances: [],
        entities: {},
        trainedAt: Date.now(),
      };
    }
    
    // Parse utterance
    const parsed = parseUtterance(utterance);
    
    // Add to training data
    this.trainingData[intent].utterances.push({
      text: utterance,
      entities: { ...parsed.entities, ...entities },
      timestamp: Date.now(),
    });
    
    // Update command patterns in registry
    const command = this.registry.getCommand(intent);
    if (command) {
      command.patterns.push(utterance);
    }
    
    this.saveTrainingData();
    
    return {
      success: true,
      intent,
      utteranceCount: this.trainingData[intent].utterances.length,
    };
  }
  
  /**
   * Remove training utterance
   */
  removeTrainingUtterance(intent, utterance) {
    if (!this.trainingData[intent]) {
      return { success: false, error: 'No training data for this intent' };
    }
    
    const index = this.trainingData[intent].utterances.findIndex(
      u => u.text === utterance
    );
    
    if (index === -1) {
      return { success: false, error: 'Utterance not found' };
    }
    
    this.trainingData[intent].utterances.splice(index, 1);
    
    // Update command patterns
    const command = this.registry.getCommand(intent);
    if (command) {
      const patternIndex = command.patterns.indexOf(utterance);
      if (patternIndex !== -1) {
        command.patterns.splice(patternIndex, 1);
      }
    }
    
    this.saveTrainingData();
    
    return { success: true };
  }
  
  /**
   * Get training data for a command
   */
  getTrainingData(intent) {
    return this.trainingData[intent] || null;
  }
  
  /**
   * Get all training data
   */
  getAllTrainingData() {
    return this.trainingData;
  }
  
  /**
   * Test command recognition
   */
  testRecognition(utterance, intentMatcher) {
    const result = intentMatcher.match(utterance);
    
    // Record test result
    const intent = result.intent;
    if (!this.accuracyStats[intent]) {
      this.accuracyStats[intent] = {
        totalTests: 0,
        successfulTests: 0,
        averageConfidence: 0,
      };
    }
    
    this.accuracyStats[intent].totalTests++;
    if (result.matched && result.confidence >= 0.7) {
      this.accuracyStats[intent].successfulTests++;
    }
    
    // Update average confidence
    const stats = this.accuracyStats[intent];
    stats.averageConfidence = 
      (stats.averageConfidence * (stats.totalTests - 1) + (result.confidence || 0)) / 
      stats.totalTests;
    
    return {
      ...result,
      stats: this.accuracyStats[intent],
    };
  }
  
  /**
   * Get accuracy stats for a command
   */
  getAccuracyStats(intent) {
    return this.accuracyStats[intent] || null;
  }
  
  /**
   * Get all accuracy stats
   */
  getAllAccuracyStats() {
    return this.accuracyStats;
  }
  
  /**
   * Clear training data for a command
   */
  clearTrainingData(intent) {
    if (this.trainingData[intent]) {
      delete this.trainingData[intent];
      delete this.accuracyStats[intent];
      this.saveTrainingData();
      return { success: true };
    }
    return { success: false, error: 'No training data found' };
  }
  
  /**
   * Clear all training data
   */
  clearAllTrainingData() {
    this.trainingData = {};
    this.accuracyStats = {};
    this.saveTrainingData();
    return { success: true };
  }
  
  /**
   * Export training data
   */
  exportTrainingData() {
    return {
      trainingData: this.trainingData,
      accuracyStats: this.accuracyStats,
      exportedAt: Date.now(),
      version: '1.0',
    };
  }
  
  /**
   * Import training data
   */
  importTrainingData(data) {
    try {
      if (data.version !== '1.0') {
        throw new Error('Unsupported training data version');
      }
      
      this.trainingData = data.trainingData || {};
      this.accuracyStats = data.accuracyStats || {};
      
      // Update command patterns in registry
      for (const [intent, trainingInfo] of Object.entries(this.trainingData)) {
        const command = this.registry.getCommand(intent);
        if (command && trainingInfo.utterances) {
          const customPatterns = trainingInfo.utterances.map(u => u.text);
          command.patterns = [
            ...new Set([...command.patterns, ...customPatterns])
          ];
        }
      }
      
      this.saveTrainingData();
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get recommendations for improving recognition
   */
  getRecommendations(intent) {
    const stats = this.accuracyStats[intent];
    const trainingData = this.trainingData[intent];
    
    if (!stats) {
      return [
        'Start testing this command to gather accuracy data',
      ];
    }
    
    const recommendations = [];
    
    // Check success rate
    const successRate = stats.successfulTests / stats.totalTests;
    if (successRate < 0.7) {
      recommendations.push('Success rate is low. Try adding more training utterances.');
    }
    
    // Check average confidence
    if (stats.averageConfidence < 0.8) {
      recommendations.push('Average confidence is low. Consider adding clearer patterns.');
    }
    
    // Check training data volume
    if (!trainingData || trainingData.utterances.length < 3) {
      recommendations.push('Add more training utterances (at least 3-5 variations).');
    }
    
    // Check utterance diversity
    if (trainingData && trainingData.utterances.length > 0) {
      const uniqueWords = new Set();
      trainingData.utterances.forEach(u => {
        u.text.split(/\s+/).forEach(word => uniqueWords.add(word.toLowerCase()));
      });
      
      if (uniqueWords.size < 5) {
        recommendations.push('Use more varied words in your training utterances.');
      }
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Recognition accuracy looks good! Keep testing.');
    }
    
    return recommendations;
  }
  
  /**
   * Analyze command usage patterns
   */
  analyzeUsagePatterns() {
    const patterns = {};
    
    for (const [intent, stats] of Object.entries(this.accuracyStats)) {
      patterns[intent] = {
        popularity: stats.totalTests,
        reliability: stats.successfulTests / stats.totalTests,
        confidence: stats.averageConfidence,
      };
    }
    
    // Sort by popularity
    const sorted = Object.entries(patterns)
      .sort((a, b) => b[1].popularity - a[1].popularity)
      .slice(0, 10);
    
    return {
      mostUsed: sorted,
      totalCommands: Object.keys(patterns).length,
      totalTests: Object.values(this.accuracyStats).reduce(
        (sum, s) => sum + s.totalTests, 0
      ),
    };
  }
}

/**
 * Create training mode instance
 */
export function createVoiceTrainingMode(commandRegistry) {
  return new VoiceTrainingMode(commandRegistry);
}

export default {
  VoiceTrainingMode,
  createVoiceTrainingMode,
};
