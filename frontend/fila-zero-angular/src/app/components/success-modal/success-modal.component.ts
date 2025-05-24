import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-success-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './success-modal.component.html',
  styleUrls: ['./success-modal.component.scss']
})
export class SuccessModalComponent {
  constructor(
    public dialogRef: MatDialogRef<SuccessModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      title: string;
      message: string;
      buttonText: string;
    }
  ) {}

  closeDialog(): void {
    this.dialogRef.close();
  }
}