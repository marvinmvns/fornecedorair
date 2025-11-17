import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-models-form',
  standalone: false,
  templateUrl: './models-form.component.html',
  styleUrls: ['./models-form.component.scss']
})
export class ModelsFormComponent implements OnInit {
  modelForm: FormGroup;
  isEditMode = false;
  modelId: string | null = null;
  loading = false;
  error: string | null = null;

  acTypes = [
    { value: 'split', label: 'Split' },
    { value: 'janela', label: 'Janela' },
    { value: 'cassete', label: 'Cassete' },
    { value: 'piso-teto', label: 'Piso Teto' },
    { value: 'dutado', label: 'Dutado' }
  ];

  voltages = [
    { value: '110V', label: '110V' },
    { value: '220V', label: '220V' },
    { value: '220V Trifásico', label: '220V Trifasico' },
    { value: '380V', label: '380V' }
  ];

  energyClasses = [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
    { value: 'D', label: 'D' },
    { value: 'E', label: 'E' }
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.modelForm = this.fb.group({
      sku: ['', [Validators.required, Validators.minLength(3)]],
      brand: ['', [Validators.required, Validators.minLength(2)]],
      modelName: ['', [Validators.required, Validators.minLength(3)]],
      btuCapacity: ['', [Validators.required, Validators.min(7000)]],
      type: ['split', Validators.required],
      inverter: [false],
      voltage: ['220V', Validators.required],
      energyEfficiencyClass: ['C', Validators.required],
      noiseLevelDb: [''],
      wifiEnabled: [false],
      recommendedAreaM2: [''],
      baseCost: ['', [Validators.required, Validators.min(0)]],
      suggestedRetailPrice: ['', [Validators.required, Validators.min(0)]],
      features: [''],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.modelId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.modelId;

    if (this.isEditMode) {
      this.loadModel();
    }
  }

  loadModel(): void {
    if (!this.modelId) return;

    this.loading = true;
    this.http.get(`${environment.apiUrl}/air-conditioner-models/${this.modelId}`)
      .subscribe({
        next: (model: any) => {
          // Parse features if it's a JSON string
          let featuresText = '';
          if (model.features) {
            try {
              const featuresArray = typeof model.features === 'string'
                ? JSON.parse(model.features)
                : model.features;
              featuresText = Array.isArray(featuresArray) ? featuresArray.join(', ') : '';
            } catch (e) {
              featuresText = model.features;
            }
          }

          this.modelForm.patchValue({
            sku: model.sku,
            brand: model.brand,
            modelName: model.modelName,
            btuCapacity: model.btuCapacity,
            type: model.type,
            inverter: model.inverter,
            voltage: model.voltage,
            energyEfficiencyClass: model.energyEfficiencyClass,
            noiseLevelDb: model.noiseLevelDb,
            wifiEnabled: model.wifiEnabled,
            recommendedAreaM2: model.recommendedAreaM2,
            baseCost: model.baseCost,
            suggestedRetailPrice: model.suggestedRetailPrice,
            features: featuresText,
            isActive: model.isActive
          });
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erro ao carregar modelo';
          this.loading = false;
          console.error(err);
        }
      });
  }

  onSubmit(): void {
    if (this.modelForm.invalid) {
      Object.keys(this.modelForm.controls).forEach(key => {
        this.modelForm.get(key)?.markAsTouched();
      });
      return;
    }

    // Process features: convert comma-separated string to JSON array
    const featuresValue = this.modelForm.get('features')?.value;
    let featuresJson = null;
    if (featuresValue && featuresValue.trim()) {
      const featuresArray = featuresValue.split(',').map((f: string) => f.trim()).filter((f: string) => f);
      featuresJson = JSON.stringify(featuresArray);
    }

    const formData = {
      sku: this.modelForm.get('sku')?.value,
      brand: this.modelForm.get('brand')?.value,
      modelName: this.modelForm.get('modelName')?.value,
      btuCapacity: parseInt(this.modelForm.get('btuCapacity')?.value),
      type: this.modelForm.get('type')?.value,
      inverter: this.modelForm.get('inverter')?.value,
      voltage: this.modelForm.get('voltage')?.value,
      energyEfficiencyClass: this.modelForm.get('energyEfficiencyClass')?.value,
      noiseLevelDb: this.modelForm.get('noiseLevelDb')?.value || null,
      wifiEnabled: this.modelForm.get('wifiEnabled')?.value,
      recommendedAreaM2: this.modelForm.get('recommendedAreaM2')?.value || null,
      baseCost: parseFloat(this.modelForm.get('baseCost')?.value),
      suggestedRetailPrice: parseFloat(this.modelForm.get('suggestedRetailPrice')?.value),
      features: featuresJson,
      isActive: this.modelForm.get('isActive')?.value
    };

    this.loading = true;
    this.error = null;

    const request = this.isEditMode
      ? this.http.put(`${environment.apiUrl}/air-conditioner-models/${this.modelId}`, formData)
      : this.http.post(`${environment.apiUrl}/air-conditioner-models`, formData);

    request.subscribe({
      next: () => {
        this.router.navigate(['/cadastro/models']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Erro ao salvar modelo';
        this.loading = false;
        console.error(err);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/cadastro/models']);
  }

  hasError(field: string, error: string): boolean {
    const control = this.modelForm.get(field);
    return !!(control?.hasError(error) && control?.touched);
  }
}
