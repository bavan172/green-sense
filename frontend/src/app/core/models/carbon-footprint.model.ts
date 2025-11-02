export interface CarbonFootprintInput {
    transportation: {
      carMiles: number;
      publicTransitMiles: number;
      flightHours: number;
    };
    home: {
      electricityKwh: number;
      gasTherm: number;
      waterGallons: number;
    };
    diet: {
      meatConsumption: 'high' | 'medium' | 'low' | 'none';
      localFoodPercentage: number;
    };
    lifestyle: {
      shoppingAmount: 'high' | 'medium' | 'low';
      wasteRecyclingPercentage: number;
    };
  }

export interface CarbonFootprintResult {
    totalEmissions: number; 
    breakdown: {
      transportation: number;
      home: number;
      diet: number;
      lifestyle: number;
    };
    comparison: {
      nationalAverage: number;
      sustainableTarget: number;
    };
    recommendations: string[];
  }