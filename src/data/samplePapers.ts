import { PaperAnalysis } from '../types/research';

export const SAMPLE_PAPERS: PaperAnalysis[] = [
  {
    id: 'paper-attention-2017',
    timestamp: Date.now() - 86400000 * 5,
    sourceType: 'sample',
    sourceName: 'arXiv:1706.03762 (Attention Is All You Need)',
    depth: 'deep',
    coreConcepts: {
      title: 'Attention Is All You Need',
      authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar', 'Jakob Uszkoreit', 'Llion Jones', 'Aidan N. Gomez', 'Łukasz Kaiser', 'Illia Polosukhin'],
      year: 2017,
      venueOrSource: 'NeurIPS 2017 / arXiv:1706.03762',
      summary: 'The Transformer replaces recurrent and convolutional neural networks entirely with multi-head self-attention mechanisms for sequence transduction. By dispensing with recurrence, the model enables full parallelization during training, significantly reducing training time while capturing long-range dependencies more effectively. It achieved state-of-the-art translation quality on WMT 2014 English-to-German (28.4 BLEU) and English-to-French (41.8 BLEU) benchmarks, establishing the foundational architecture for modern large language models.',
      problemStatement: 'Dominant sequence transduction models relied on complex recurrent or convolutional neural networks that processed tokens sequentially, inherently preventing parallelization during training and struggling to maintain long-range dependencies.',
      motivation: 'To design a sequence-to-sequence architecture based solely on attention mechanisms, thereby eliminating recurrence constraints, accelerating GPU parallel computing, and directly connecting any two token positions with constant path length O(1).',
      methodology: 'An encoder-decoder architecture constructed of stacked self-attention and point-wise fully connected feed-forward layers, augmented with sinusoidal positional encodings and residual connections with layer normalization.',
      keyAlgorithms: [
        {
          name: 'Scaled Dot-Product Attention',
          mathConcept: 'Attention(Q, K, V) = softmax(Q K^T / sqrt(d_k)) V',
          explanation: 'Computes compatibility scores between query and key vectors, scales by sqrt(d_k) to counteract vanishing gradients in large dimensions, and applies softmax weights across values.'
        },
        {
          name: 'Multi-Head Attention',
          mathConcept: 'MultiHead(Q,K,V) = Concat(head_1, ..., head_h) W^O',
          explanation: 'Linearly projects queries, keys, and values h times with learned parameter matrices, allowing the model to jointly attend to information from different representation subspaces at different positions.'
        },
        {
          name: 'Sinusoidal Positional Encoding',
          mathConcept: 'PE(pos, 2i) = sin(pos/10000^(2i/d_model)), PE(pos, 2i+1) = cos(...)',
          explanation: 'Injects sequence order into the non-recurrent architecture by encoding absolute positions using geometric progression wavelengths from 2pi to 10000*2pi.'
        }
      ],
      mainContributions: [
        'Introduced the Transformer, the first sequence transduction model relying entirely on self-attention without recurrence or convolutions.',
        'Established Multi-Head Attention allowing simultaneous attending to distinct subspaces and syntactic/semantic relationships.',
        'Achieved state-of-the-art BLEU scores on WMT 2014 translation while training in a fraction of previous compute time (3.5 days on 8 P100 GPUs).'
      ],
      reportedResults: [
        { metric: 'WMT 2014 En-De BLEU', score: '28.4', context: 'Exceeded previous best models (including ensembles) by over 2.0 BLEU points', paperFact: true },
        { metric: 'WMT 2014 En-Fr BLEU', score: '41.8', context: 'New single-model state-of-the-art at 1/4 the training cost of prior models', paperFact: true },
        { metric: 'Training FLOPs (Base)', score: '3.3e18', context: 'Trained for 12 hours on 8 P100 GPUs (100,000 steps)', paperFact: true }
      ]
    },
    architecture: {
      mermaidCode: `graph TD
  InputTokens["Source Tokens & Target Tokens"] --> Embeddings["Input & Output Embeddings"]
  Embeddings --> PosEncoding["Sinusoidal Positional Encoding"]
  PosEncoding --> EncInput["Encoder Input Vector"]
  
  subgraph EncoderStack ["Encoder Stack (6 Identical Layers)"]
    EncInput --> EncSelfAttn["Multi-Head Self-Attention"]
    EncSelfAttn --> EncAddNorm1["Add & LayerNorm"]
    EncAddNorm1 --> EncFFN["Position-wise Feed-Forward Network"]
    EncFFN --> EncAddNorm2["Add & LayerNorm"]
  end

  subgraph DecoderStack ["Decoder Stack (6 Identical Layers)"]
    DecShifted["Shifted Right Target Tokens"] --> DecEmbed["Target Embedding + PE"]
    DecEmbed --> MaskedAttn["Masked Multi-Head Self-Attention"]
    MaskedAttn --> DecAddNorm1["Add & LayerNorm"]
    DecAddNorm1 --> CrossAttn["Cross Multi-Head Attention (Queries from Dec, Keys/Values from Enc)"]
    EncAddNorm2 -.-> CrossAttn
    CrossAttn --> DecAddNorm2["Add & LayerNorm"]
    DecAddNorm2 --> DecFFN["Position-wise Feed-Forward"]
    DecFFN --> DecAddNorm3["Add & LayerNorm"]
  end

  DecAddNorm3 --> LinearProjection["Linear Projection (Vocab Size)"]
  LinearProjection --> SoftmaxLayer["Softmax Probability Layer"]
  SoftmaxLayer --> OutputTokens["Predicted Output Token Probabilities"]`,
      explanation: 'The Transformer employs an Encoder-Decoder structure. The Encoder transforms an input sequence into continuous representations using 6 stacked layers of Multi-Head Self-Attention and Feed-Forward sublayers. The Decoder introduces an additional masked self-attention layer to preserve auto-regressive causality, followed by cross-attention over encoder outputs.',
      stages: [
        { stage: 'Input/Data', component: 'Byte-Pair Encoding (BPE)', details: 'Tokenizes sentences with a shared vocabulary of ~37,000 tokens for English-German and 32,000 for English-French.' },
        { stage: 'Preprocessing', component: 'Sinusoidal Positional Encodings', details: 'Added directly to embeddings to retain relative/absolute token distance without recurrent state.' },
        { stage: 'Model Layers', component: '6x Encoder & 6x Decoder Blocks', details: 'Dimension d_model=512, inner layer d_ff=2048, 8 parallel attention heads.' },
        { stage: 'Algorithms', component: 'Scaled Dot-Product & Multi-Head Attention', details: 'Queries, Keys, Values multiplied with scaling factor 1/sqrt(d_k) and dropout rate 0.1.' },
        { stage: 'Training/Inference', component: 'Adam Optimizer with Warmup & Label Smoothing', details: 'Learning rate warmup for 4000 steps followed by inverse square root decay, label smoothing eps=0.1.' },
        { stage: 'Output', component: 'Linear + Softmax Auto-regressive Generation', details: 'Beam search with beam size 4 and length penalty alpha=0.6.' }
      ]
    },
    studentOpportunities: [
      {
        id: 'opp-1',
        title: 'Rotary Position Embeddings (RoPE) vs Sinusoids on Mini-Transformer',
        exactExtension: 'Replace the static sinusoidal positional encodings in a 4-layer Transformer with RoPE (Rotary Position Embeddings) and benchmark on sequence extrapolation (evaluating on 2x longer context than trained on).',
        technicalMotivation: 'Sinusoidal encodings degrade quickly when evaluating beyond the training context length. RoPE applies rotation matrices directly to Query and Key projections, providing better relative distance awareness and length extrapolation for modern LLMs.',
        targetMetric: 'Perplexity stability when context length increases from 256 tokens (train) to 512 & 1024 tokens (eval).',
        baseline: 'Standard Vaswani Sinusoidal Positional Encoding Transformer.',
        expectedTradeoff: 'Slightly higher compute overhead per attention head for matrix rotations, but substantially better length extrapolation.',
        techStack: ['PyTorch', 'Hugging Face Datasets (WikiText-2)', 'Weights & Biases', 'Google Colab / Single RTX 3060'],
        difficulty: 'Intermediate',
        experiment: 'Train both models on 256-token chunks for 15 epochs. Evaluate perplexity at 256, 384, 512, and 1024 tokens on held-out text without retraining.',
        finalDeliverable: 'Open-source GitHub repository with clean PyTorch modular attention head implementations, benchmark Jupyter notebook with extrapolation plots, and interactive Streamlit generation demo.'
      },
      {
        id: 'opp-2',
        title: 'Attention Head Pruning and Entropy Analysis for Mobile Translation',
        exactExtension: 'Measure Shannon entropy of attention matrices across all 8 heads and systematically prune the 3 lowest-entropy heads post-training using structured weight masking.',
        technicalMotivation: 'Many attention heads learn redundant or trivial diagonal patterns. Pruning inactive heads reduces memory footprint and inference latency on resource-constrained student devices without full model retraining.',
        targetMetric: '25% inference latency reduction on CPU/mobile with < 0.5 BLEU score degradation.',
        baseline: 'Unpruned base Transformer (8 heads per layer, 6 layers).',
        expectedTradeoff: 'Possible drop in nuanced syntactic disambiguation in long sentences in exchange for faster inference throughput.',
        techStack: ['PyTorch', 'TorchScript / ONNX Runtime', 'SacreBLEU', 'Matplotlib (Attention heatmaps)'],
        difficulty: 'Beginner',
        experiment: 'Compute attention weights on 500 test sentences. Rank heads by attention entropy variance. Mask heads sequentially (1 through 4) and measure BLEU vs inference time on an Intel/Apple Silicon CPU.',
        finalDeliverable: 'A CLI tool that loads a checkpoint, outputs head contribution heatmaps, prunes low-utility heads, and exports a lightweight ONNX model ready for local inference.'
      },
      {
        id: 'opp-3',
        title: 'Linear Attention Approximations via Kernel Features (Performer/Linformer)',
        exactExtension: 'Replace the O(N^2) Softmax attention kernel with random feature maps (Positive Random Features) to achieve O(N) computational and memory complexity.',
        technicalMotivation: 'Quadratic complexity prevents standard Transformers from processing long documents, code repositories, or high-resolution spectrograms on consumer hardware.',
        targetMetric: 'Reduction from O(N^2) to O(N) peak VRAM consumption on sequences from 512 up to 4096 tokens.',
        baseline: 'Standard Scaled Dot-Product Attention.',
        expectedTradeoff: 'Slightly lower peak BLEU score (approx. 1.0-1.5 BLEU loss) due to kernel approximation variance.',
        techStack: ['PyTorch', 'CUDA event timing', 'Triton or custom PyTorch Autograd functions', 'Weights & Biases'],
        difficulty: 'Advanced',
        experiment: 'Benchmarking peak memory allocation via torch.cuda.max_memory_allocated() and wall-clock time across sequence lengths N in [512, 1024, 2048, 4096].',
        finalDeliverable: 'A drop-in PyTorch module comparing exact vs linear attention, accompanied by a reproducible benchmarking suite and a technical write-up analyzing when the approximation breaks down.'
      }
    ],
    reproducibility: {
      dataset: 'WMT 2014 English-German (4.5M sentence pairs) and English-French (36M sentence pairs).',
      datasetAvailability: 'Open Source',
      codeAvailability: 'Official open-source repository released in Tensor2Tensor (GitHub).',
      codeUrl: 'https://github.com/tensorflow/tensor2tensor',
      framework: 'TensorFlow (originally) / PyTorch reimplementations ubiquitous.',
      hardware: '8 NVIDIA P100 GPUs (Base model: 12 hours; Big model: 3.5 days).',
      evaluationMetrics: ['BLEU score (tokenized and uncased)', 'Wall-clock training time', 'Floating point operations (FLOPs)'],
      trainingRequirements: '100,000 steps for base model, Adam optimizer (beta1=0.9, beta2=0.98, eps=1e-9), batch size ~25,000 tokens.',
      difficulty: 'High',
      paperFactsNotes: 'Paper Facts: Authors trained on 8x P100 GPUs with synchronous parameter updates and custom learning rate schedules. Student Note: Reproduction of the full WMT benchmark requires high-end multi-GPU clusters, but a 2-4 layer mini-Transformer on Multi30k or IWSLT runs easily on a single consumer GPU within 45 minutes.'
    },
    projectBlueprint: {
      title: 'Length-Extrapolating Mini-Transformer with Rotary Position Embeddings',
      researchQuestion: 'How does replacing Sinusoidal Positional Embeddings with Rotary Position Embeddings (RoPE) affect out-of-distribution sequence length perplexity and attention dispersion in small-scale language models?',
      baseline: 'A 4-layer, 4-head Transformer language model using standard Vaswani sinusoidal positional encodings trained on WikiText-2.',
      proposedModification: 'Implement RoPE directly into the Q, K matrix projections before the dot-product computation, and test length extrapolation at 1.5x, 2x, and 4x training context lengths.',
      hypothesis: 'RoPE will maintain lower perplexity and avoid runaway attention collapse when evaluating sequences exceeding the training horizon by up to 2x.',
      datasetAndTools: {
        datasets: ['WikiText-2 (raw/tokenized)', 'TinyStories (optional fast alternative)'],
        toolsAndLibraries: ['PyTorch 2.x', 'Hugging Face Transformers / Tokenizers', 'Weights & Biases', 'Matplotlib / Seaborn for attention maps']
      },
      implementationSteps: [
        {
          stepNumber: 1,
          title: 'Data Pipeline & Tokenizer Setup',
          tasks: ['Download WikiText-2 dataset using datasets library', 'Train a Byte-Pair Encoding (BPE) tokenizer (vocab size 8,000)', 'Create fixed-length sequence data loaders with sliding windows'],
          deliverable: 'dataset_pipeline.py with automated unit test verifying token sequence dimensions.'
        },
        {
          stepNumber: 2,
          title: 'Modular Attention Block Implementation',
          tasks: ['Implement baseline MultiHeadAttention class with sinusoidal encoding', 'Implement RotaryEmbedding class computing complex exponential rotations', 'Add configuration toggle to switch between positional strategies'],
          deliverable: 'models/attention.py verified against synthetic input tensors.'
        },
        {
          stepNumber: 3,
          title: 'Training Loop & Checkpointing',
          tasks: ['Write training harness with AdamW and cosine annealing schedule', 'Log training/validation loss curves to Weights & Biases', 'Save periodic checkpoints for best validation loss'],
          deliverable: 'train.py CLI supporting --pe-type=[sinusoid|rope] and --seed arguments.'
        },
        {
          stepNumber: 4,
          title: 'Extrapolation Evaluation Suite',
          tasks: ['Evaluate both models on context windows: 256, 384, 512, 1024 tokens', 'Extract attention weight matrices and compute average entropy', 'Plot perplexity degradation curves as context length scales'],
          deliverable: 'evaluate_extrapolation.py generating publication-quality vector plots.'
        }
      ],
      evaluationPlan: {
        metrics: ['Perplexity (PPL) at 256, 512, 1024 tokens', 'Peak VRAM consumption (MB)', 'Per-epoch training wall-clock time (seconds)'],
        baselineComparison: 'Compare RoPE curves against standard sinusoidal encodings across 3 random seeds.',
        validationStrategy: '5-fold validation on held-out test splits to confirm statistical significance.'
      },
      timelineWeeks: [
        { week: 'Week 1', focus: 'Paper study & Architecture Scaffolding', tasks: ['Read sections 3.2.1-3.2.3 of Attention paper', 'Scaffold PyTorch project structure and dataset loaders', 'Implement tokenizer'] },
        { week: 'Week 2', focus: 'Attention Engine & RoPE Math', tasks: ['Implement Scaled Dot-Product Attention from scratch', 'Code Rotary Embedding rotation formula', 'Write tensor dimension unit tests'] },
        { week: 'Week 3', focus: 'Model Training & Baseline Benchmarking', tasks: ['Train baseline Sinusoidal model on GPU', 'Train RoPE variant with identical hyperparameters', 'Log convergence telemetry on Wandb'] },
        { week: 'Week 4', focus: 'Extrapolation Testing & Attention Visualization', tasks: ['Run length extrapolation test scripts', 'Generate heatmaps of attention dispersion', 'Draft empirical comparison table'] },
        { week: 'Week 5', focus: 'Refactoring, Documentation & Demo', tasks: ['Build interactive Streamlit text completion demo', 'Write professional README with reproduction steps', 'Draft final research report and resume bullet'] }
      ],
      expectedChallenges: [
        {
          challenge: 'Out-of-memory (OOM) errors during long sequence evaluation.',
          solution: 'Use torch.no_grad() and evaluate in mini-batches with gradient accumulation disabled.'
        },
        {
          challenge: 'RoPE rotation math causing shape mismatch in multi-head queries.',
          solution: 'Reshape queries to (batch, heads, seq_len, head_dim) and apply rotation in pairs of dimensions.'
        }
      ],
      gitHubDeliverable: {
        repoName: 'rope-transformer-extrapolation',
        directoryStructure: `rope-transformer-extrapolation/
├── configs/
│   ├── baseline_sinusoid.yaml
│   └── experimental_rope.yaml
├── models/
│   ├── __init__.py
│   ├── attention.py
│   ├── transformer.py
│   └── positional_encodings.py
├── scripts/
│   ├── train.py
│   ├── evaluate.py
│   └── visualize_attention.py
├── notebooks/
│   └── extrapolation_analysis.ipynb
├── tests/
│   └── test_shapes.py
├── requirements.txt
└── README.md`,
        readmeHighlights: 'Clear installation guide, single-command training scripts, benchmark comparison graphs, and Colab one-click link.'
      },
      resumeBullet: 'Architected and implemented a modular PyTorch Transformer from scratch, comparing Rotary Position Embeddings against Sinusoidal encodings; demonstrated 34% lower perplexity degradation during 2x context extrapolation while authoring an open-source benchmarking suite.'
    }
  },
  {
    id: 'paper-yolov8-2023',
    timestamp: Date.now() - 86400000 * 3,
    sourceType: 'sample',
    sourceName: 'Ultralytics YOLOv8 Architecture Report (2023)',
    depth: 'deep',
    coreConcepts: {
      title: 'Real-Time Object Detection with YOLOv8',
      authors: ['Glenn Jocher', 'Ayush Chaurasia', 'Jing Qiu'],
      year: 2023,
      venueOrSource: 'Ultralytics Technical Specification / GitHub 2023',
      summary: 'YOLOv8 introduces a cutting-edge real-time computer vision framework featuring an anchor-free decoupled detection head, C2f (cross-stage partial with 2 convolutions) backbone stages, and task-aligned positive sample matching. By abandoning anchor boxes, YOLOv8 simplifies non-maximum suppression (NMS) and directly predicts bounding box distributions using Distribution Focal Loss (DFL) and Complete IoU (CIoU). It delivers superior speed-accuracy trade-offs across object detection, instance segmentation, and pose estimation benchmarks on COCO.',
      problemStatement: 'Previous anchor-based detectors required manual hyperparameter tuning for anchor priors, suffered from computational bottlenecks in dense anchor assignment, and struggled with scale variations on small and overlapping objects.',
      motivation: 'To create an anchor-free unified vision framework that optimizes both edge device latency and mean Average Precision (mAP) through decoupled feature representations and modern cross-stage bottlenecks.',
      methodology: 'A modified CSPDarknet backbone featuring C2f modules that fuse high-level semantics with low-level details, connected to a bi-directional Path Aggregation Network (PANet) neck and an anchor-free decoupled head separating classification and regression branches.',
      keyAlgorithms: [
        {
          name: 'Anchor-Free Decoupled Head',
          mathConcept: 'Loss_total = lambda_cls * Loss_BCE + lambda_box * Loss_CIoU + lambda_dfl * Loss_DFL',
          explanation: 'Separates classification probability computation from bounding box geometric regression into independent sub-networks, accelerating convergence and eliminating anchor box priors.'
        },
        {
          name: 'Task-Aligned Assigner (TAL)',
          mathConcept: 't = s^alpha * u^beta',
          explanation: 'Dynamically selects top-k positive samples during training based on a joint alignment metric t combining classification score s and IoU overlap u.'
        },
        {
          name: 'Distribution Focal Loss (DFL)',
          mathConcept: 'DFL(S_i, S_{i+1}) = - ((y_{i+1} - y) log(S_i) + (y - y_i) log(S_{i+1}))',
          explanation: 'Models bounding box coordinates as continuous probability distributions rather than Dirac delta points, improving boundary localization under occlusions.'
        }
      ],
      mainContributions: [
        'Introduced the C2f module combining Cross-Stage Partial concepts with ELAN-style residual splits to enhance gradient flow.',
        'Switched completely to an anchor-free decoupled detection head with Distribution Focal Loss and Task-Aligned Sample Assignment.',
        'Established new real-time state-of-the-art mAP50-95 benchmarks on COCO while running at >100 FPS on edge accelerators.'
      ],
      reportedResults: [
        { metric: 'COCO mAP 50-95 (YOLOv8x)', score: '53.9%', context: 'Outperformed YOLOv5 and YOLOv7 at comparable parameter footprints', paperFact: true },
        { metric: 'Inference Latency (YOLOv8n A100)', score: '1.47 ms', context: 'Nano model runs at over 600 FPS on TensorRT FP16', paperFact: true },
        { metric: 'Model Parameters (YOLOv8n)', score: '3.2M params / 8.7 GFLOPs', context: 'Extremely lightweight footprint suitable for mobile microcontrollers', paperFact: true }
      ]
    },
    architecture: {
      mermaidCode: `graph TD
  InputImage["Input Image (3 x 640 x 640)"] --> StemConv["Stem Conv: Conv2d(k=3, s=2) + SiLU"]
  
  subgraph Backbone ["CSPDarknet Backbone with C2f Modules"]
    StemConv --> C2f_1["Stage P1/P2: Conv + C2f Block"]
    C2f_1 --> C2f_2["Stage P3: C2f (stride 2) - 80x80"]
    C2f_2 --> C2f_3["Stage P4: C2f (stride 2) - 40x40"]
    C2f_3 --> C2f_4["Stage P5: C2f (stride 2) - 20x20"]
    C2f_4 --> SPPF["SPPF (Spatial Pyramid Pooling Fast)"]
  end

  subgraph Neck ["PANet Bi-directional Feature Pyramid"]
    SPPF --> TopDown["Top-Down Path: Upsample & Concatenate"]
    TopDown --> BottomUp["Bottom-Up Path: Downsample & Concatenate"]
    C2f_3 -.-> TopDown
    C2f_2 -.-> TopDown
  end

  subgraph DecoupledHead ["Anchor-Free Decoupled Head"]
    BottomUp --> ClsBranch["Classification Branch (BCE Loss)"]
    BottomUp --> RegBranch["Box Regression Branch (CIoU + DFL)"]
  end

  ClsBranch --> DecoupledNMS["Decoupled NMS Post-Processing"]
  RegBranch --> DecoupledNMS
  DecoupledNMS --> Detections["Final Bounding Boxes, Labels & Confidences"]`,
      explanation: 'YOLOv8 feeds images through a C2f-enhanced CSPDarknet backbone, pools multiscale context through SPPF, routes features through a bi-directional PANet neck, and predicts classes and box regression coordinates via separate decoupled branches without anchor priors.',
      stages: [
        { stage: 'Input/Data', component: 'Mosaic Augmentation & Letterbox Resize', details: 'Images resized to 640x640 with 4-image Mosaic augmentation disabled in final 10 epochs.' },
        { stage: 'Preprocessing', component: 'Normalization & Color Jitter', details: 'RGB normalized to [0, 1] with random affine, perspective, and HSV shifts.' },
        { stage: 'Model Layers', component: 'Backbone C2f & SPPF Blocks', details: 'Stack of split-convolution bottlenecks with shortcut connections and SiLU activations.' },
        { stage: 'Algorithms', component: 'Task-Aligned Assigner & DFL', details: 'Selects positive anchors based on joint classification and localization alignment score.' },
        { stage: 'Training/Inference', component: 'SGD / AdamW with Cosine LR Decay', details: 'Warmup for 3 epochs followed by cosine learning rate annealing and weight decay 0.0005.' },
        { stage: 'Output', component: 'Anchor-Free Non-Maximum Suppression (NMS)', details: 'Filters overlapping boxes with IoU threshold 0.7 and score threshold 0.25.' }
      ]
    },
    studentOpportunities: [
      {
        id: 'opp-yolo-1',
        title: 'Post-Training INT8 Quantization on Raspberry Pi / Jetson Nano',
        exactExtension: 'Quantize a fine-tuned YOLOv8n model from FP32 to INT8 precision using TensorRT and ONNX Runtime, measuring accuracy retention and inference FPS on an ARM microcontroller or single-board computer.',
        technicalMotivation: 'Edge embedded vision systems cannot afford high wattage or large GPU memory. INT8 quantization reduces memory bandwidth by 4x and leverages INT8 tensor cores for real-time edge robotics.',
        targetMetric: 'Achieve 3x inference speedup (FPS) on Raspberry Pi 5 / Jetson with < 1.0 mAP degradation on COCO-val.',
        baseline: 'Standard PyTorch FP32 YOLOv8n model.',
        expectedTradeoff: 'Slight accuracy loss on small, distant objects due to lower numerical dynamic range.',
        techStack: ['PyTorch', 'Ultralytics', 'ONNX Runtime', 'TensorRT', 'Raspberry Pi / Jetson'],
        difficulty: 'Intermediate',
        experiment: 'Calibrate INT8 quantization using 200 representative dataset images. Benchmark latency across batch size 1 and compare mAP50 and mAP50-95 against FP32.',
        finalDeliverable: 'A complete embedded deployment script with benchmark graphs, an export pipeline for ONNX/TensorRT, and a live webcam FPS counter.'
      },
      {
        id: 'opp-yolo-2',
        title: 'Thermal Infrared Adaptation for Nighttime Search and Rescue',
        exactExtension: 'Adapt YOLOv8 by replacing the 3-channel RGB stem with a single-channel thermal input module and fine-tuning on the FLIR Thermal Dataset with Focal Loss adjustments.',
        technicalMotivation: 'Thermal imagery lacks color texture and has distinct noise characteristics. Standard RGB weights fail to generalize to monochromatic temperature gradients without tailored stem adaptation.',
        targetMetric: 'Increase thermal person/vehicle detection mAP50 from 42% (vanilla RGB transfer) to >68%.',
        baseline: 'Pre-trained YOLOv8n evaluated directly on FLIR thermal images.',
        expectedTradeoff: 'Loss of color-based class disambiguation, requiring reliance entirely on morphological silhouettes.',
        techStack: ['PyTorch', 'Ultralytics YOLOv8', 'FLIR Thermal Dataset', 'Albumentations'],
        difficulty: 'Beginner',
        experiment: 'Initialize backbone with COCO weights (averaging 3-channel weights to 1 channel). Train for 30 epochs with contrastive augmentation and compare detection rates under low-contrast conditions.',
        finalDeliverable: 'A specialized thermal detection weights file, a GitHub repo with evaluation Jupyter notebooks, and side-by-side inference video demos.'
      },
      {
        id: 'opp-yolo-3',
        title: 'Small Object Feature Pyramid Enhancement for Drone Imagery',
        exactExtension: 'Introduce an additional P2 high-resolution detection head (160x160 feature map) to the YOLOv8 neck to detect micro-scale objects in aerial drone footage (VisDrone dataset).',
        technicalMotivation: 'Standard YOLOv8 downsamples inputs by 8x, 16x, and 32x. Objects smaller than 8x8 pixels lose spatial representation entirely before reaching the detection head.',
        targetMetric: 'Boost small-object mAP (AP_small) by at least 15% on the VisDrone benchmark.',
        baseline: 'Standard YOLOv8s with P3, P4, P5 heads.',
        expectedTradeoff: 'Approx. 20-25% increase in GFLOPs due to the higher resolution 160x160 feature pyramid layer.',
        techStack: ['PyTorch', 'VisDrone Dataset', 'Wandb', 'CUDA Event Timing'],
        difficulty: 'Advanced',
        experiment: 'Modify the YOLOv8 architecture YAML to tap P2 features from the second C2f block. Retrain on VisDrone and evaluate AP_s, AP_m, AP_l metrics.',
        finalDeliverable: 'Custom modular YOLOv8 architecture configuration file, training harness, and aerial detection comparison visualizations.'
      }
    ],
    reproducibility: {
      dataset: 'MS COCO 2017 (118k train images, 5k val images, 80 object categories).',
      datasetAvailability: 'Open Source',
      codeAvailability: 'Official open-source repository maintained by Ultralytics on GitHub.',
      codeUrl: 'https://github.com/ultralytics/ultralytics',
      framework: 'PyTorch (Python 3.8+).',
      hardware: 'Trained across 8x NVIDIA A100 GPUs (single GPU training fully supported for nano/small models).',
      evaluationMetrics: ['mAP@0.5', 'mAP@0.5:0.95', 'Inference latency (ms)', 'GFLOPs', 'Parameter count'],
      trainingRequirements: '500 epochs for COCO from scratch, or 30-50 epochs for fine-tuning; SGD optimizer (lr=0.01, momentum=0.937).',
      difficulty: 'Low',
      paperFactsNotes: 'Paper Facts: Authors trained all variants (n, s, m, l, x) on multi-A100 clusters. Student Note: Highly accessible! Fine-tuning YOLOv8n on custom datasets takes < 15 minutes on a free Google Colab T4 GPU.'
    },
    projectBlueprint: {
      title: 'High-Speed Edge Detection Suite with YOLOv8 INT8 Quantization',
      researchQuestion: 'How much does post-training INT8 quantization degrade boundary box precision (CIoU) compared to inference latency gains across edge compute architectures?',
      baseline: 'Standard PyTorch YOLOv8n running in FP32 precision on CPU and edge hardware.',
      proposedModification: 'Implement Post-Training Quantization (PTQ) with dynamic calibration on representative domain samples using ONNX Runtime and TensorRT.',
      hypothesis: 'INT8 quantization will achieve >2.5x inference speedup with less than 1.2% drop in mAP50-95.',
      datasetAndTools: {
        datasets: ['COCO-val 2017 (subset)', 'Pascal VOC 2012'],
        toolsAndLibraries: ['PyTorch 2.x', 'Ultralytics', 'ONNX Runtime', 'Netron for graph inspection', 'OpenCV']
      },
      implementationSteps: [
        {
          stepNumber: 1,
          title: 'Model Benchmarking & FP32 Baseline',
          tasks: ['Load pre-trained YOLOv8n weights', 'Set up standardized latency benchmarking suite with warm-up cycles', 'Record baseline accuracy and memory usage'],
          deliverable: 'benchmark_baseline.py with JSON telemetry output.'
        },
        {
          stepNumber: 2,
          title: 'ONNX Graph Export & Simplification',
          tasks: ['Export model to ONNX with dynamic batch axes', 'Run onnx-simplifier to fold redundant operations', 'Verify numerical parity between PyTorch and ONNX'],
          deliverable: 'export_onnx.py and simplified model graph.'
        },
        {
          stepNumber: 3,
          title: 'INT8 Calibration & Quantization Pipeline',
          tasks: ['Build calibration data loader with 250 diverse test frames', 'Execute min-max and entropy calibration algorithms', 'Export quantized ONNX model'],
          deliverable: 'quantize_int8.py supporting custom calibration sets.'
        },
        {
          stepNumber: 4,
          title: 'Comparative Evaluation & Edge Dashboard',
          tasks: ['Run side-by-side inference on video feed', 'Plot speed-accuracy trade-off curves', 'Package into clean CLI tool'],
          deliverable: 'edge_detector_cli.py with real-time FPS overlay.'
        }
      ],
      evaluationPlan: {
        metrics: ['mAP@0.5:0.95', 'Inference latency (ms per frame)', 'Peak VRAM/RAM (MB)', 'Model file size (MB)'],
        baselineComparison: 'Compare FP32, FP16, and INT8 variants across identical test frames.',
        validationStrategy: 'Compute mean and standard deviation of latency over 1,000 continuous inference iterations.'
      },
      timelineWeeks: [
        { week: 'Week 1', focus: 'YOLOv8 Anatomy & Setup', tasks: ['Study C2f and Decoupled Head mechanics', 'Set up development environment and dataset', 'Reproduce baseline mAP'] },
        { week: 'Week 2', focus: 'ONNX Export & Graph Profiling', tasks: ['Export to ONNX', 'Profile latency bottlenecks per layer using Netron and ONNX Runtime', 'Fix export warnings'] },
        { week: 'Week 3', focus: 'INT8 Calibration Implementation', tasks: ['Implement calibration loader', 'Test Symmetric vs Asymmetric quantization', 'Measure quantization error per tensor'] },
        { week: 'Week 4', focus: 'Edge Benchmarking & Live Demo', tasks: ['Deploy to local CPU / edge board', 'Benchmark FPS under varying resolutions', 'Build interactive OpenCV live demo'] },
        { week: 'Week 5', focus: 'Documentation & Portfolio Package', tasks: ['Write technical report comparing trade-offs', 'Clean up GitHub repository with GitHub Actions CI', 'Record demo GIF'] }
      ],
      expectedChallenges: [
        {
          challenge: 'Accuracy collapse on tiny objects after INT8 quantization.',
          solution: 'Use KL-divergence calibration instead of min-max to preserve dynamic range in high-frequency feature maps.'
        },
        {
          challenge: 'Decoupled NMS operations failing to export to ONNX cleanly.',
          solution: 'Export raw tensor outputs from the head and run decoupled NMS post-processing in Python/C++.'
        }
      ],
      gitHubDeliverable: {
        repoName: 'yolov8-edge-quantization-suite',
        directoryStructure: `yolov8-edge-quantization-suite/
├── calibration/
│   └── dataset_loader.py
├── scripts/
│   ├── benchmark.py
│   ├── export_onnx.py
│   └── quantize.py
├── demo/
│   └── live_webcam.py
├── benchmarks/
│   └── latency_report.md
├── requirements.txt
└── README.md`,
        readmeHighlights: 'One-line installation, Docker container for reproducible builds, comparative benchmark tables, and live demo instructions.'
      },
      resumeBullet: 'Developed a high-throughput edge computer vision pipeline with YOLOv8, implementing INT8 post-training quantization with KL-divergence calibration to achieve a 2.8x inference speedup on embedded hardware with under 0.8% mAP loss.'
    }
  },
  {
    id: 'paper-resnet-2015',
    timestamp: Date.now() - 86400000 * 7,
    sourceType: 'sample',
    sourceName: 'arXiv:1512.03385 (Deep Residual Learning for Image Recognition)',
    depth: 'deep',
    coreConcepts: {
      title: 'Deep Residual Learning for Image Recognition',
      authors: ['Kaiming He', 'Xiangyu Zhang', 'Shaoqing Ren', 'Jian Sun'],
      year: 2015,
      venueOrSource: 'CVPR 2016 (Best Paper Award) / arXiv:1512.03385',
      summary: 'ResNet addresses the degradation problem in ultra-deep neural networks where accuracy saturates and degrades as depth increases. By reformulating layers as learning residual functions with reference to layer inputs (H(x) = F(x) + x) via identity shortcut connections, networks can easily optimize identity mappings. This architectural breakthrough enabled training networks with 152 layers—8x deeper than VGG—winning 1st place in ImageNet 2015 with a record 3.57% top-5 error rate.',
      problemStatement: 'As convolutional neural networks grew deeper, they encountered a fundamental degradation problem: training error increased rather than decreased, caused not by vanishing gradients (which were addressed by batch normalization) but by severe optimization hurdles in learning identity mappings.',
      motivation: 'If a deeper model can simply copy shallower layers and set additional layers to identity mappings, deeper networks should theoretically never perform worse than shallow ones. Residual learning makes identity mapping the default baseline.',
      methodology: 'Residual learning framework using identity skip connections that perform parameter-free additions. For deep models (ResNet-50/101/152), a 3-layer bottleneck block (1x1, 3x3, 1x1 convolutions) is utilized to reduce dimensionality before spatial convolutions.',
      keyAlgorithms: [
        {
          name: 'Identity Residual Mapping',
          mathConcept: 'y = F(x, {W_i}) + x',
          explanation: 'Passes input x directly through an identity shortcut, forcing stacked nonlinear layers F(x) to learn the residual modification rather than the entire transformation H(x).'
        },
        {
          name: 'Bottleneck Residual Block',
          mathConcept: 'Conv1x1(C -> C/4) -> Conv3x3(C/4 -> C/4) -> Conv1x1(C/4 -> C) + x',
          explanation: 'Uses 1x1 convolutions to compress and restore channel dimensions, allowing deeper networks to be trained with lower computational complexity.'
        },
        {
          name: 'Batch Normalization Integration',
          mathConcept: 'BN(Conv(x)) + x -> ReLU',
          explanation: 'Normalizes activations before addition and nonlinearities to preserve gradient magnitudes throughout 100+ layer backpropagation.'
        }
      ],
      mainContributions: [
        'Solved the deep network degradation problem via identity shortcut connections, enabling ultra-deep neural architectures.',
        'Designed the 3-layer Bottleneck design allowing scaling up to 1,000 layers on CIFAR and 152 layers on ImageNet.',
        'Swept 1st place across 5 major visual recognition tracks: ImageNet Classification, Detection, Localization, and COCO Detection and Segmentation.'
      ],
      reportedResults: [
        { metric: 'ImageNet Top-5 Error (ResNet-152)', score: '3.57%', context: 'Won ImageNet 2015, surpassing human-level visual accuracy (~5.1%)', paperFact: true },
        { metric: 'COCO Detection mAP', score: '37.4%', context: '28% relative improvement over prior state-of-the-art visual models', paperFact: true },
        { metric: 'CIFAR-10 Depth Scaling', score: '1202 layers trained', context: 'Proved optimization stability without gradient explosion or collapse', paperFact: true }
      ]
    },
    architecture: {
      mermaidCode: `graph TD
  InputImage["Input Image (3 x 224 x 224)"] --> Conv1["7x7 Conv, 64 filters, stride 2"]
  Conv1 --> BN1["Batch Normalization & ReLU"]
  BN1 --> MaxPool["3x3 Max Pooling, stride 2 (56x56)"]
  
  subgraph Stage1 ["Stage conv2_x: 3x Bottleneck Blocks (64-dim)"]
    MaxPool --> Block1["Residual Block 1 (F(x) + x)"]
    Block1 --> Block2["Residual Block 2"]
    Block2 --> Block3["Residual Block 3"]
  end

  subgraph Stage2 ["Stage conv3_x: 4x Bottleneck Blocks (128-dim, stride 2)"]
    Block3 --> Block4["Residual Block 4 with Downsampling"]
    Block4 --> Block5["Residual Block 5-7"]
  end

  subgraph Stage3 ["Stage conv4_x: 6x Bottleneck Blocks (256-dim, stride 2)"]
    Block5 --> Block6["Residual Block 8 with Downsampling"]
    Block6 --> Block7["Residual Blocks 9-23"]
  end

  subgraph Stage4 ["Stage conv5_x: 3x Bottleneck Blocks (512-dim, stride 2)"]
    Block7 --> Block8["Residual Block 24 with Downsampling"]
    Block8 --> Block9["Residual Blocks 25-26 (7x7)"]
  end

  Block9 --> GlobalAvgPool["Global Average Pooling (1x1x2048)"]
  GlobalAvgPool --> FC1000["1000-way Fully Connected Layer"]
  FC1000 --> Softmax["Softmax Categorical Distribution"]
  Softmax --> ClassProbs["Predicted Image Class Probabilities"]`,
      explanation: 'ResNet takes an image through a 7x7 conv stem, followed by 4 hierarchical stages of residual blocks with identity shortcuts. Dimension downsampling occurs via 1x1 projection shortcuts when feature maps halve in resolution. A global average pooling layer compresses the final feature map into a 2048-dimensional embedding for classification.',
      stages: [
        { stage: 'Input/Data', component: 'ImageNet RGB Preprocessing', details: 'Random resized crop to 224x224, random horizontal flip, and ImageNet per-channel mean/std normalization.' },
        { stage: 'Preprocessing', component: 'Stem 7x7 Convolution', details: 'Reduces spatial resolution from 224x224 to 56x56 via stride 2 and max pooling.' },
        { stage: 'Model Layers', component: 'Bottleneck Residual Blocks', details: '1x1 reduction, 3x3 spatial conv, 1x1 expansion, summed with identity shortcut.' },
        { stage: 'Algorithms', component: 'Identity Shortcut Addition', details: 'Element-wise tensor addition F(x) + x executed with zero parameter overhead.' },
        { stage: 'Training/Inference', component: 'SGD with Momentum & Weight Decay', details: 'Initial LR 0.1, decayed by 10x at milestones, weight decay 0.0001, momentum 0.9.' },
        { stage: 'Output', component: 'Global Average Pooling + FC', details: 'Replaces bulky fully connected layers of VGG, dramatically lowering parameter count.' }
      ]
    },
    studentOpportunities: [
      {
        id: 'opp-res-1',
        title: 'Squeeze-and-Excitation Residual Networks (SE-ResNet) on CIFAR-100',
        exactExtension: 'Integrate Squeeze-and-Excitation channel attention blocks inside ResNet-18 residual connections, dynamically weighting channel importance before identity addition.',
        technicalMotivation: 'Standard ResNet treats all feature channels with uniform weight. Channel attention models interdependencies between feature maps, improving representational capacity with <1% extra parameters.',
        targetMetric: 'Improve CIFAR-100 Top-1 classification accuracy by > 2.5% over baseline ResNet-18.',
        baseline: 'Standard ResNet-18 trained on CIFAR-100.',
        expectedTradeoff: 'Slight increase in per-batch training time (~5%) due to global average pooling and dual-FC channel excitation.',
        techStack: ['PyTorch', 'Torchvision', 'CIFAR-100', 'Matplotlib / Seaborn'],
        difficulty: 'Beginner',
        experiment: 'Train baseline ResNet-18 vs SE-ResNet-18 for 60 epochs using identical learning rate schedules and random seeds. Record convergence loss and top-1/top-5 accuracy.',
        finalDeliverable: 'Modular PyTorch SE-ResNet implementation, comparative training loss curves, and channel attention weight heatmap visualizations.'
      },
      {
        id: 'opp-res-2',
        title: 'Stochastic Depth (Layer Dropping) Regularization',
        exactExtension: 'Implement Stochastic Depth layer dropping, randomly skipping entire residual blocks during training while keeping all blocks active at test time.',
        technicalMotivation: 'Very deep residual networks suffer from diminishing feature reuse. Stochastic Depth acts as an architectural ensemble, reducing training time by 25% while serving as a powerful regularizer.',
        targetMetric: 'Reduce training wall-clock time by 20% while matching or improving test generalization error.',
        baseline: 'Standard ResNet-50 trained with fixed depth.',
        expectedTradeoff: 'Requires linear drop probability scheduling across layers to prevent early layer representation collapse.',
        techStack: ['PyTorch', 'Torchvision', 'Weights & Biases', 'CUDA Timers'],
        difficulty: 'Intermediate',
        experiment: 'Train with drop rate p increasing linearly from 0.0 in stage 1 to 0.4 in stage 4. Measure training time per epoch and final validation accuracy.',
        finalDeliverable: 'Custom PyTorch StochasticDepthModule wrapper, benchmarking suite, and documentation on hyperparameter tuning.'
      },
      {
        id: 'opp-res-3',
        title: 'Quantization-Aware Training (QAT) to INT4 Precision',
        exactExtension: 'Quantize ResNet weights and residual additions to 4-bit integer representation using fake-quantization nodes and straight-through estimator (STE) backpropagation.',
        technicalMotivation: 'Deploying deep vision models onto microcontroller edge chips (e.g. STM32 / ESP32) requires model footprints under 5MB and ultra-low VRAM budgets.',
        targetMetric: 'Compress model file size from 44MB (FP32) to < 6MB with < 2.0% top-1 accuracy loss on TinyImageNet.',
        baseline: 'Full precision ResNet-18.',
        expectedTradeoff: 'Higher training overhead due to straight-through gradient approximations during backward passes.',
        techStack: ['PyTorch', 'PyTorch QAT / TensorRT', 'TinyImageNet', 'ONNX'],
        difficulty: 'Advanced',
        experiment: 'Fine-tune pre-trained FP32 weights with INT4 fake-quantization operators for 10 epochs. Evaluate accuracy and peak memory consumption.',
        finalDeliverable: 'Full quantization-aware training script, exported INT4 model artifact, and memory profiling benchmark report.'
      }
    ],
    reproducibility: {
      dataset: 'ImageNet 2012 classification dataset (1.28 million training images, 50,000 validation images).',
      datasetAvailability: 'Open Source',
      codeAvailability: 'Official Caffe implementation released by Microsoft Research; Torch/PyTorch implementations native to standard libraries.',
      codeUrl: 'https://github.com/KaimingHe/deep-residual-networks',
      framework: 'Caffe (originally) / PyTorch & TensorFlow native.',
      hardware: '8x NVIDIA GPU cluster for ImageNet training.',
      evaluationMetrics: ['Top-1 error rate', 'Top-5 error rate', 'Training wall-clock time', 'FLOPs'],
      trainingRequirements: 'SGD with batch size 256, initial lr 0.1, weight decay 0.0001, 60-90 epochs.',
      difficulty: 'Medium',
      paperFactsNotes: 'Paper Facts: Authors trained on ImageNet across 8 GPUs for 2-3 days. Student Note: A ResNet-18 or ResNet-34 on CIFAR-10/100 or TinyImageNet trains to convergence on a single consumer GPU or free Colab within 35 minutes.'
    },
    projectBlueprint: {
      title: 'Attention-Augmented ResNet for Fine-Grained Image Classification',
      researchQuestion: 'Can channel-wise squeeze-and-excitation attention combined with stochastic depth prevent overfitting and improve fine-grained classification on low-data regimes?',
      baseline: 'Standard ResNet-18 trained from scratch on CIFAR-100 without pre-trained weights.',
      proposedModification: 'Insert SE blocks into bottleneck connections with a linearly scheduled stochastic depth drop rate (p_max = 0.2).',
      hypothesis: 'SE attention and stochastic depth will improve generalization on fine-grained classes by at least 3.0% top-1 accuracy while reducing training time.',
      datasetAndTools: {
        datasets: ['CIFAR-100 (60,000 32x32 color images across 100 fine-grained classes)'],
        toolsAndLibraries: ['PyTorch 2.x', 'Torchvision', 'Albumentations', 'Matplotlib', 'Wandb']
      },
      implementationSteps: [
        {
          stepNumber: 1,
          title: 'Baseline ResNet Setup & CIFAR-100 Harness',
          tasks: ['Implement ResNet-18 architecture with modified 3x3 stem for 32x32 inputs', 'Create standardized train/val data loaders with Cutout augmentation', 'Train baseline and record top-1/top-5 benchmarks'],
          deliverable: 'models/resnet_cifar.py and baseline benchmark logs.'
        },
        {
          stepNumber: 2,
          title: 'Squeeze-and-Excitation Module Implementation',
          tasks: ['Implement SEBlock class with adaptive pooling and two linear layers with reduction ratio r=16', 'Integrate SEBlock into residual block forward pass', 'Verify gradient propagation with unit tests'],
          deliverable: 'models/se_resnet.py with unit test suite.'
        },
        {
          stepNumber: 3,
          title: 'Stochastic Depth Integration',
          tasks: ['Implement DropPath function with Bernoulli sampling during training mode', 'Apply progressive drop schedule from 0.0 to 0.2 across layers', 'Benchmark epoch training times'],
          deliverable: 'models/stochastic_depth.py and training profiler.'
        },
        {
          stepNumber: 4,
          title: 'Ablation Study & Attention Visualization',
          tasks: ['Conduct 4 ablation runs: (1) Baseline, (2) +SE, (3) +StochasticDepth, (4) Combined', 'Extract and visualize channel excitation weights per class', 'Generate publication-quality accuracy tables'],
          deliverable: 'ablation_analysis.py and vector visualization plots.'
        }
      ],
      evaluationPlan: {
        metrics: ['Top-1 Accuracy (%)', 'Top-5 Accuracy (%)', 'Training time per epoch (s)', 'Parameter count (M)'],
        baselineComparison: 'Compare against standard ResNet-18 and Wide-ResNet across 3 random seeds.',
        validationStrategy: 'Stratified 5-fold cross-validation on CIFAR-100 test split.'
      },
      timelineWeeks: [
        { week: 'Week 1', focus: 'Paper study & Baseline Engineering', tasks: ['Read sections 3-4 of ResNet paper', 'Code CIFAR-tailored ResNet-18', 'Establish benchmark accuracy'] },
        { week: 'Week 2', focus: 'Squeeze-and-Excitation Implementation', tasks: ['Implement SE attention mechanism', 'Validate channel weighting gradients', 'Run initial convergence test'] },
        { week: 'Week 3', focus: 'Stochastic Depth & Regularization', tasks: ['Code stochastic layer skipping', 'Tune drop probability schedule', 'Verify inference deterministic mode'] },
        { week: 'Week 4', focus: 'Ablation Runs & Attention Inspection', tasks: ['Execute complete matrix of ablation experiments', 'Plot attention distribution across classes', 'Analyze failure cases'] },
        { week: 'Week 5', focus: 'Documentation & Portfolio Presentation', tasks: ['Write comprehensive README with reproduction instructions', 'Create interactive Gradio demo for image classification', 'Draft final technical report'] }
      ],
      expectedChallenges: [
        {
          challenge: 'CIFAR 32x32 images losing too much resolution with standard ResNet 7x7 conv stem.',
          solution: 'Replace initial 7x7 stride-2 conv and max pool with a single 3x3 stride-1 conv to preserve spatial resolution.'
        },
        {
          challenge: 'Stochastic depth causing gradient vanishing if early layers are dropped too frequently.',
          solution: 'Start drop probability at 0.0 for stage 1 and scale linearly to p_max only in the final stages.'
        }
      ],
      gitHubDeliverable: {
        repoName: 'attention-augmented-resnet',
        directoryStructure: `attention-augmented-resnet/
├── configs/
│   ├── baseline_resnet18.yaml
│   └── se_stochastic_resnet18.yaml
├── models/
│   ├── __init__.py
│   ├── resnet_cifar.py
│   ├── se_block.py
│   └── stochastic_depth.py
├── scripts/
│   ├── train.py
│   ├── evaluate.py
│   └── visualize_attention.py
├── notebooks/
│   └── cifar100_ablation_study.ipynb
├── tests/
│   └── test_forward_backward.py
├── requirements.txt
└── README.md`,
        readmeHighlights: 'Clean reproduction commands, ablation summary table, Gradio one-click demo, and pre-trained checkpoint weights.'
      },
      resumeBullet: 'Engineered an Attention-Augmented ResNet architecture in PyTorch, integrating Squeeze-and-Excitation channel attention and stochastic depth to achieve a 3.4% top-1 accuracy improvement on CIFAR-100 while reducing training wall-clock time by 18%.'
    }
  }
];
