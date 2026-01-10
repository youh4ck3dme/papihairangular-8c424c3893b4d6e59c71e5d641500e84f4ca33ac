import { Component } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-story-visuals',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './story-visuals.html',
  styleUrls: ['./story-visuals.scss']
})
export class StoryVisuals {
  // Base path pre assets - uľahčuje čitateľnosť HTML
  protected readonly assetPath = 'assets/images/blog/story/';
}
