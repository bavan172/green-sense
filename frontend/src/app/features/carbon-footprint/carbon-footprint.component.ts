import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-carbon-footprint',
  templateUrl: './carbon-footprint.component.html',
  imports: [CommonModule, FormsModule],
  standalone: true,
  styleUrls: ['./carbon-footprint.component.scss']
})
export class CarbonFootprintComponent {
  carKm: number = 0;
  electricityKwh: number = 0;
  gasTherms: number = 0;
  totalEmissions: number | null = null;

  calculateFootprint(event: Event): void {
    event.preventDefault();
    
  
    const carEmissionFactor = 0.21; 
    const electricityEmissionFactor = 0.5;
    const gasEmissionFactor = 5.3; 
  
    const carKm = Number(this.carKm);
    const electricityKwh = Number(this.electricityKwh);
    const gasTherms = Number(this.gasTherms);

    if (isNaN(carKm) || carKm < 0 || isNaN(electricityKwh) || electricityKwh < 0 || isNaN(gasTherms) || gasTherms < 0) {
      alert('Please enter valid positive numbers for all fields.');
      return;
    }
  
    const carEmissions = carKm * carEmissionFactor;
    const electricityEmissions = electricityKwh * electricityEmissionFactor;
    const gasEmissions = gasTherms * gasEmissionFactor;
  
    this.totalEmissions = parseFloat((carEmissions + electricityEmissions + gasEmissions).toFixed(2));
    console.log('Total Emissions:', this.carKm, this.electricityKwh,this.gasTherms,this.totalEmissions);
  }
  
}
