import dimod
from dimod import ConstrainedQuadraticModel, Binary

cities = [0, 1, 2, 3]
time_steps = [0, 1, 2, 3]

c = {
    (0, 1): 11, (0, 2): 15, (0, 3): 22,
    (1, 0): 11, (1, 2): 38, (1, 3): 21,
    (2, 0): 15, (2, 1): 38, (2, 3): 27,
    (3, 0): 22, (3, 1): 21, (3, 2): 27
}

# Binary variables
x = {(i, p): Binary(f'x_{i}_{p}') for i in cities for p in time_steps}

# CQM
cqm = ConstrainedQuadraticModel()

# Objective Function
H_cost = 0
for p in range(len(time_steps) - 1):
    for i in cities:
        for j in cities:
            if i != j and (i, j) in c:
                H_cost += c[(i, j)] * x[(i, p)] * x[(j, p + 1)]

cqm.set_objective(H_cost)

# One city per time step
for p in time_steps:
    cqm.add_constraint(
        sum(x[(i, p)] for i in cities) == 1
    )

# Visit each city exactly once
for i in cities:
    cqm.add_constraint(
        sum(x[(i, p)] for p in time_steps) == 1
    )

print(cqm)