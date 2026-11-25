Open any AI API pricing page and one number jumps right out. Input tokens might cost three dollars per million, while output tokens cost fifteen dollars. That is a five-times jump. And once you compare against cached input at thirty cents, output tokens can cost fifty times more.

At first glance, that feels backwards. Input and output tokens are both just numbers flowing through the exact same Transformer neural network and the exact same weights. One token in, one token out. So why does generating a token cost five times more than reading one?

The answer is not arbitrary markup. It comes down to GPU physics. Reading tokens and writing tokens run on the exact same model, yet on real silicon they behave like two completely different workloads with completely different bottlenecks. Let us look inside the GPU.

Every LLM request splits into two phases. First comes prefill, where the model digests your entire prompt to emit the very first token, setting your Time to First Token. Then comes decode, where it streams the rest of the answer token by token.

During prefill, your entire prompt is already sitting in memory upfront. Nothing has to wait. The GPU packs all of your input tokens into one big matrix and pushes them through every layer of the model all at once, completely in parallel, in a single pass.

Decode works the opposite way. Language models are autoregressive, meaning they only generate one token at a time. Each new word depends on the previous word, so the GPU must finish token ninety-nine and feed it back in before it can even start computing token one hundred.

To see why that explodes your bill, zoom inside an AI GPU like an H100. Massive high-bandwidth memory, or HBM, stores the model weights, linked by a narrow memory bus to ultra-fast on-chip SRAM and Tensor Cores. Those math units pack around a thousand teraflops of compute, but every byte must cross that bandwidth pipe first.

During prefill, the GPU loads each layer's weights from HBM once and multiplies them against a huge matrix of hundreds or thousands of input tokens together. That matrix-matrix multiply, called GEMM, keeps Tensor Cores packed with work. It is like a freight train hauling a thousand containers in one trip.

During decode, you only have one new token vector. Yet to produce that single output token, the GPU must still stream the entire model's weights, often over a hundred gigabytes, from HBM into SRAM, run one tiny vector multiply, discard the weights, and repeat for the next word. It is like driving an eighteen-wheeler across town to deliver a single postcard.

Put the utilization meters side by side and the bottleneck is unmistakable. Prefill is compute-bound, keeping Tensor Cores busy around eighty percent. Decode hits the memory wall: it is memory-bound, redlining the HBM bus at one hundred percent while ninety-five percent of the GPU's compute sits completely idle, waiting on bytes.

And the memory wall is only half the story. In a Transformer, every new token attends to every token before it. If the GPU had to recompute all earlier tokens from scratch at each step, generation would collapse. Instead, servers store every past token's Key and Value vectors in VRAM, creating the KV cache.

The KV cache eliminates redundant math, but adds a second tax. Every output token appends another slice to VRAM, so the cache grows linearly with length. Worse, on every decode step, the GPU must read both the model weights and that growing KV cache across the exact same HBM bandwidth pipe.

You might ask: why not batch a hundred users together so one weight read serves a hundred tokens at once? Continuous batching helps hugely, until two walls hit. First, a hundred KV caches quickly exhaust the VRAM memory limit. Second, huge batches increase per-token latency, making streaming feel painfully slow.

Zoom out and the pricing makes total sense. Prefill borrows a GPU for a few dozen milliseconds at peak efficiency. A thousand-token decode holds a VRAM slot hostage for ten or twenty full seconds at terrible compute efficiency. Providers are not really selling tokens. They are renting you GPU-seconds.

Two modern trends are widening this gap even further. First is prompt caching. System prompts, tool schemas, and codebase files repeat across calls, so servers reuse their precomputed KV cache and discount cached inputs up to ninety percent. Output tokens are freshly generated every time and can never be cached.

The second multiplier is reasoning models. Ask a reasoning model a short question and you might see a two-sentence answer, while thousands of hidden thinking tokens ran behind the scenes. Every single thinking token is still an autoregressive decode step, burning HBM bandwidth and billed at full output rates.

Look at a typical coding agent call and the inversion is stark. Ninety-three percent of your token volume might be cached input context, costing just a couple of pennies. Meanwhile, the remaining seven percent of reasoning and output tokens can eat seventy-five percent of your total bill.

Without clever engineering, output tokens would cost twenty or fifty times more. Labs fight the memory wall by shrinking what crosses the HBM bus. Quantization trims weights down to eight or four bits. Grouped-Query Attention, or GQA, and Multi-Head Latent Attention, or MLA, compress the KV cache. And Mixture of Experts, or MoE, activates only a fraction of weights per token.

Another breakthrough is speculative decoding, which bends autoregression. A tiny, blazing-fast draft model guesses four or five tokens ahead, and the giant model verifies all of them at once in a single parallel pass. When the guesses match, you get several output tokens for the bandwidth cost of one.

At the serving layer, PagedAttention manages KV cache memory like virtual memory pages, eliminating VRAM fragmentation so more users fit per GPU. Modern clusters also use prefill-decode disaggregation, separating compute-heavy prefill GPUs from memory-heavy decode GPUs so long prompts never stall active users streaming responses.

Understanding this hardware physics immediately improves how you build AI apps. Because input is cheap and cacheable while output is slow and expensive, shift work from output to input. Provide rich context upfront and ask for concise outputs: request a twelve-line unified diff instead of rewriting an entire four-hundred-line file.

Second, protect your prompt cache prefix. Keep static instructions, tools, and docs at the very top of your prompt. Never put a dynamic timestamp at byte zero, or you will bust the cache on every request. And route simple, verbose tasks to smaller models, saving heavy reasoning budgets for genuinely hard steps.

Combine those three habits: keep outputs tight, keep prefixes static for cache hits, and route easy work to smaller models. In production apps, those changes routinely slash API spend by fifty to eighty percent while making responses feel noticeably faster to your users.

If you remember one mental model from this video, remember this: reading tokens is parallel math, bounded by compute; writing tokens is serial memory traffic, bounded by bandwidth. Next time you see a five-times output price on an API page, you are not seeing markup. You are seeing the physics of streaming gigabytes across silicon just to pick the next word.
