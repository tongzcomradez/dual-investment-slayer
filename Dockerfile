# Use the official Bun image
FROM oven/bun

# Set the working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install

# Copy the rest of the app
COPY . .

# Run the app
CMD ["bun", "run", "index.ts"]