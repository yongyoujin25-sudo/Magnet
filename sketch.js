let magnets = [];
let irons = [];
const NUM_MAGNETS = 5;
const NUM_IRONS = 2000;

function setup() {
  createCanvas(800, 600);
  
  // Create Walker Magnets
  for (let i = 0; i < NUM_MAGNETS; i++) {
    magnets.push(new Magnet());
  }
  
  // Create Iron Particles
  for (let i = 0; i < NUM_IRONS; i++) {
    irons.push(new Iron());
  }
  
  background(10);
}

function draw() {
  // Semi-transparent background for trail effect
  background(10, 50);

  // Update Magnets (Walkers) - They are NOT shown
  for (let magnet of magnets) {
    magnet.walk();
  }

  // Update and Show Iron Particles
  for (let iron of irons) {
    iron.interact(magnets);
    iron.update();
    iron.show();
  }
}

// ---------------------------------------------------------
// Magnet Class (Attractor & Walker)
// ---------------------------------------------------------
class Magnet {
  constructor() {
    this.pos = createVector(random(width), random(height));
    // Walker noise offsets
    this.tx = random(1000);
    this.ty = random(1000);
    this.angle = random(TWO_PI);
    this.len = 60; // Distance between poles
    this.strength = 100;
  }

  walk() {
    // Walker logic using Perlin noise for smooth natural movement
    this.pos.x = map(noise(this.tx), 0, 1, 0, width);
    this.pos.y = map(noise(this.ty), 0, 1, 0, height);
    
    // Rotate slowly
    this.angle += 0.01;
    
    this.tx += 0.005;
    this.ty += 0.005;
  }

  // Calculate magnetic force on a particle
  // Simulating a dipole: North repels, South attracts (for field line visualization)
  calculateForce(particlePos) {
    let force = createVector(0, 0);
    
    // Calculate North Pole Position (Repels test particle)
    let northPos = p5.Vector.fromAngle(this.angle);
    northPos.mult(this.len / 2);
    northPos.add(this.pos);

    // Calculate South Pole Position (Attracts test particle)
    let southPos = p5.Vector.fromAngle(this.angle + PI); // Opposite side
    southPos.mult(this.len / 2);
    southPos.add(this.pos);

    // Force from North (Repulsion)
    let dirN = p5.Vector.sub(particlePos, northPos);
    let distN = dirN.mag();
    distN = constrain(distN, 5, 100); // Constrain to prevent infinity
    dirN.normalize();
    let strengthN = (this.strength) / (distN * distN);
    dirN.mult(strengthN);
    
    // Force from South (Attraction)
    let dirS = p5.Vector.sub(southPos, particlePos); // Vector pointing TO south
    let distS = dirS.mag();
    distS = constrain(distS, 5, 100);
    dirS.normalize();
    let strengthS = (this.strength) / (distS * distS);
    dirS.mult(strengthS);

    // Combine forces
    force.add(dirN);
    force.add(dirS);

    return force;
  }
}

// ---------------------------------------------------------
// Iron Class (Particle)
// ---------------------------------------------------------
class Iron {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(random(-1, 1), random(-1, 1));
    this.acc = createVector(0, 0);
    this.maxSpeed = 8;
    // Iron usually is grey/silvery
    this.color = color(200, 200, 255, 150);
  }

  interact(magnets) {
    for (let magnet of magnets) {
      let force = magnet.calculateForce(this.pos);
      this.applyForce(force);
    }
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    
    // Friction/Damping to simulate iron filings resistance
    this.vel.mult(0.95);
    this.acc.mult(0);

    // Reset if it gets stuck or flies off (keep the visual dynamic)
    if (this.pos.x < 0 || this.pos.x > width || 
        this.pos.y < 0 || this.pos.y > height) {
      this.reset();
    }
    
    // Random reset to keep the flow moving and not just clumping at South poles
    if (frameCount % 600 === 0 && random(1) < 0.1) {
       this.reset(); 
    }
  }
  
  reset() {
      this.pos = createVector(random(width), random(height));
      this.vel = createVector(0,0);
  }

  show() {
    stroke(this.color);
    strokeWeight(1.5);
    
    // Draw particles aligned with velocity to look like shavings
    push();
    translate(this.pos.x, this.pos.y);
    // Align visualization with the movement vector
    rotate(this.vel.heading());
    line(-2, 0, 2, 0); 
    pop();
  }
}
