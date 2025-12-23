module.exports = {
  apps: [
    {
      name: 'laravel-ssr',
      script: 'artisan',
      args: 'inertia:start-ssr',
      interpreter: 'php',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '150M', // Keeps RAM usage low on your VPS
    },
  ],
};
