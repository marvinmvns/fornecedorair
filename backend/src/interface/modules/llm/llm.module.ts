import { Module } from '@nestjs/common';
import { OllamaAdapter } from '../../../infrastructure/adapters/ollama.adapter';

@Module({
  providers: [OllamaAdapter],
  exports: [OllamaAdapter],
})
export class LlmModule {}
